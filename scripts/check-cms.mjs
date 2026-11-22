#!/usr/bin/env node
/**
 * Compares the CMS config (public/admin/config.yml) with the content schemas (src/schemas/*.ts).
 * Uses the JSON schemas Astro generates into .astro/collections/ — run `astro sync` first (`yarn check:cms` does).
 *
 * Reports:
 *  - fields that exist only in the CMS or only in the schema
 *  - fields optional in the CMS but required by the schema (an editor could save content that breaks the build)
 *  - select options that differ from the schema's enum
 */
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

const config = parse(readFileSync('public/admin/config.yml', 'utf8'), { merge: true, maxAliasCount: -1 });
const schemaOf = (name) => JSON.parse(readFileSync(`.astro/collections/${name}.schema.json`, 'utf8'));

/** CMS file → Astro collection, where the names differ (default: the file's name) */
const fileSchemas = { 'settings/global': 'settings', 'fixed-pages/index': 'pages', 'fixed-pages/404': 'pages' };

/** CMS collection / file → Astro collection */
const targets = [
  ...config.collections.filter((c) => c.folder).map((c) => ({ label: c.name, fields: c.fields, schema: c.name })),
  ...config.collections
    .filter((c) => c.files)
    .flatMap((c) =>
      c.files.map((f) => {
        const label = `${c.name}/${f.name}`;
        return { label, fields: f.fields, schema: fileSchemas[label] ?? f.name };
      }),
    ),
];

const problems = [];
const report = (path, msg) => problems.push(`${path}: ${msg}`);

/** zod optional objects / nullable unions → the object branch */
const unwrap = (s) => s?.anyOf?.find((x) => x.type === 'object' || x.type === 'array') ?? s;

function compareObject(fields, schema, path) {
  schema = unwrap(schema);
  const props = schema.properties ?? {};
  const required = new Set(schema.required ?? []);
  const cmsNames = new Set();

  for (const field of fields) {
    if (field.name === 'body') continue; // markdown body, not part of the frontmatter schema
    cmsNames.add(field.name);
    const here = `${path}.${field.name}`;
    const prop = props[field.name];
    if (!prop) {
      report(here, 'in the CMS but not in the schema');
      continue;
    }
    if (field.required === false && required.has(field.name)) report(here, 'optional in the CMS, required in the schema');
    compareField(field, prop, here);
  }
  for (const name of Object.keys(props)) {
    if (name !== '_template' && !name.startsWith('$') && !cmsNames.has(name)) report(`${path}.${name}`, 'in the schema but not in the CMS');
  }
}

function compareField(field, prop, path) {
  prop = unwrap(prop);
  const widget = field.widget ?? 'string';
  if (widget === 'object') return compareObject(field.fields, prop, path);
  if (widget === 'list') {
    const items = unwrap(prop.items ?? {});
    if (field.types) {
      const variants = new Map((items.oneOf ?? items.anyOf ?? []).map((v) => [v.properties._template.const, v]));
      for (const type of field.types) {
        const variant = variants.get(type.name);
        if (!variant) report(`${path}[${type.name}]`, 'block type in the CMS but not in the schema');
        else compareObject(type.fields ?? [], variant, `${path}[${type.name}]`);
        variants.delete(type.name);
      }
      for (const name of variants.keys()) report(`${path}[${name}]`, 'block type in the schema but not in the CMS');
    } else if (field.fields) compareObject(field.fields, items, path);
    return;
  }
  if (widget === 'select' && prop.enum) {
    const options = field.options.map((o) => (typeof o === 'object' ? o.value : o));
    const missing = prop.enum.filter((v) => !options.includes(v));
    const extra = options.filter((v) => !prop.enum.includes(v));
    if (missing.length || extra.length) report(path, `select options differ (missing: ${missing}; extra: ${extra})`);
  }
}

for (const t of targets) compareObject(t.fields, schemaOf(t.schema), t.label);

if (problems.length) {
  console.error(`CMS config and content schemas differ:\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log(`CMS config matches the content schemas (${targets.length} collections/files).`);
