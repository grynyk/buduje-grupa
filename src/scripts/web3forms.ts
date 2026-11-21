/**
 * Progressive enhancement for every `<form data-web3form>`:
 * client-side validation, fetch submit to Web3Forms, inline status (no alert()).
 * Without JS the form still posts to Web3Forms directly.
 */
const MESSAGES = {
  sending: 'Wysyłanie…',
  success: 'Dziękujemy! Wiadomość została wysłana — odezwiemy się najszybciej, jak to możliwe.',
  error: 'Nie udało się wysłać wiadomości. Spróbuj ponownie lub zadzwoń do nas.',
  network: 'Problem z połączeniem. Sprawdź internet i spróbuj ponownie.',
};

type Field = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

const isValid = (el: Field) =>
  el instanceof HTMLInputElement && el.type === 'checkbox' ? el.checked : el.checkValidity() && el.value.trim() !== '';

function setFieldState(form: HTMLFormElement, el: Field, valid: boolean) {
  el.closest('.field, .consent')?.classList.toggle('is-invalid', !valid);
  el.setAttribute('aria-invalid', String(!valid));
  form.querySelector(`[data-error-for="${el.name}"]`)?.classList.toggle('is-visible', !valid);
}

/** E-mail subject gets the topic appended: "Nowe zapytanie ze strony … — Wycena". */
function withTopicInSubject(form: HTMLFormElement) {
  const data = new FormData(form);
  const topic = form.querySelector<HTMLInputElement>('[data-topic-input]')?.value.trim();
  const subject = data.get('subject');
  if (topic && typeof subject === 'string') data.set('subject', `${subject} — ${topic}`);
  return data;
}

/** "Płyta" → "plyta": accent/case-insensitive matching for Polish text. */
const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ł/g, 'l')
    .trim();

/**
 * Topic combobox (WAI-ARIA combobox pattern): free text + a full-width suggestion list.
 * Opens on focus/click/typing, filters as you type, ↑/↓ to move, Enter to pick, Esc to close.
 */
function bindTopic(form: HTMLFormElement) {
  const root = form.querySelector<HTMLElement>('[data-combo]');
  const input = root?.querySelector<HTMLInputElement>('[data-topic-input]');
  const list = root?.querySelector<HTMLUListElement>('[data-combo-list]');
  if (!root || !input || !list) return;
  const toggle = root.querySelector<HTMLButtonElement>('[data-combo-toggle]');
  const options = [...list.querySelectorAll<HTMLLIElement>('[role="option"]')];
  let active = -1;

  const visible = () => options.filter((o) => !o.hidden);
  const isOpen = () => !list.hidden;

  const clearActive = () => {
    active = -1;
    options.forEach((o) => o.classList.remove('is-active'));
    input.removeAttribute('aria-activedescendant');
  };

  const setActive = (index: number) => {
    const shown = visible();
    active = shown.length ? (index + shown.length) % shown.length : -1;
    options.forEach((o) => o.classList.remove('is-active'));
    const current = shown[active];
    if (current) {
      current.classList.add('is-active');
      current.scrollIntoView({ block: 'nearest' });
      input.setAttribute('aria-activedescendant', current.id);
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  };

  const markSelected = () => {
    const value = fold(input.value);
    options.forEach((o) => o.setAttribute('aria-selected', String(fold(o.dataset.value!) === value)));
  };

  const close = () => {
    list.hidden = true;
    root.classList.remove('is-open');
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    active = -1;
  };

  // show everything when empty or when the value is exactly one of the suggestions
  const filter = () => {
    const q = fold(input.value);
    const exact = options.some((o) => fold(o.dataset.value!) === q);
    options.forEach((o) => (o.hidden = !!q && !exact && !fold(o.dataset.value!).includes(q)));
  };

  const open = () => {
    filter();
    markSelected();
    if (!visible().length) return close();
    list.hidden = false;
    list.scrollTop = 0;
    root.classList.add('is-open');
    input.setAttribute('aria-expanded', 'true');
    clearActive();
  };

  const choose = (option: HTMLLIElement) => {
    input.value = option.dataset.value!;
    markSelected();
    close();
  };

  input.addEventListener('focus', open);
  input.addEventListener('click', () => !isOpen() && open());
  input.addEventListener('input', open);
  input.addEventListener('blur', () => setTimeout(close, 120)); // let option clicks land first

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen()) open();
      const down = e.key === 'ArrowDown';
      // from "nothing highlighted": ↓ → first, ↑ → last
      setActive(active === -1 ? (down ? 0 : visible().length - 1) : active + (down ? 1 : -1));
    } else if (e.key === 'Enter' && isOpen() && active > -1) {
      e.preventDefault(); // pick the suggestion instead of submitting the form
      choose(visible()[active]);
    } else if (e.key === 'Escape' && isOpen()) {
      e.preventDefault();
      close();
    } else if (e.key === 'Tab') {
      close();
    }
  });

  options.forEach((o) => {
    o.addEventListener('mousedown', (e) => e.preventDefault()); // keep focus in the input
    o.addEventListener('click', () => choose(o));
    o.addEventListener('mousemove', () => setActive(visible().indexOf(o)));
  });

  toggle?.addEventListener('mousedown', (e) => e.preventDefault());
  toggle?.addEventListener('click', () => {
    if (isOpen()) return close();
    input.focus();
    options.forEach((o) => (o.hidden = false)); // toggle always shows the full list
    list.hidden = false;
    root.classList.add('is-open');
    input.setAttribute('aria-expanded', 'true');
    markSelected();
  });

  form.addEventListener('reset', () => requestAnimationFrame(() => (markSelected(), close())));
}

/**
 * Pre-fill topic + message from links:
 *   ?projekt=Las%2090        (catalog design pages)
 *   ?realizacja=Dom%20…      (realization pages — "ask about a similar house")
 */
function prefill(form: HTMLFormElement) {
  const params = new URLSearchParams(location.search);
  const project = params.get('projekt');
  const realization = params.get('realizacja');
  const preset = project
    ? { topic: `Projekt z katalogu: ${project}`, message: `Dzień dobry, interesuje mnie projekt „${project}”. Proszę o kontakt.` }
    : realization
      ? { topic: `Realizacja: ${realization}`, message: `Dzień dobry, interesuje mnie dom podobny do realizacji „${realization}”. Proszę o kontakt.` }
      : null;
  if (!preset) return;
  const topic = form.querySelector<HTMLInputElement>('[data-topic-input]');
  if (topic && !topic.value) topic.value = preset.topic;
  const message = form.querySelector<HTMLTextAreaElement>('textarea[name="message"]');
  if (message && !message.value) message.value = preset.message;
}

function bind(form: HTMLFormElement) {
  if (form.dataset.bound) return;
  form.dataset.bound = 'true';

  const submitBtn = form.querySelector<HTMLButtonElement>('[data-submit]')!;
  const submitLabel = form.querySelector<HTMLElement>('[data-submit-label]')!;
  const status = form.querySelector<HTMLElement>('[data-status]')!;
  const originalText = submitLabel.textContent;
  const success = form.dataset.success || MESSAGES.success;

  const setStatus = (type: 'success' | 'error' | '', text = '') => {
    status.textContent = text;
    status.dataset.type = type;
  };

  prefill(form);
  bindTopic(form);

  form.addEventListener('input', (e) => {
    const el = e.target as Field;
    if (el.getAttribute('aria-invalid') === 'true' && isValid(el)) setFieldState(form, el, true);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setStatus('');

    let firstInvalid: Field | null = null;
    form.querySelectorAll<Field>('[required]').forEach((el) => {
      const valid = isValid(el);
      setFieldState(form, el, valid);
      if (!valid && !firstInvalid) firstInvalid = el;
    });
    if (firstInvalid) {
      (firstInvalid as Field).focus();
      return;
    }

    submitLabel.textContent = MESSAGES.sending;
    submitBtn.disabled = true;

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: withTopicInSubject(form),
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success !== false) {
        setStatus('success', success);
        // optional immediate download (guide form) as a backup to the e-mail
        form.querySelector<HTMLElement>('[data-download]')?.removeAttribute('hidden');
        form.reset();
      } else {
        setStatus('error', data.message ? `${MESSAGES.error} (${data.message})` : MESSAGES.error);
      }
    } catch {
      setStatus('error', MESSAGES.network);
    } finally {
      submitLabel.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}

export function initWeb3Forms() {
  document.querySelectorAll<HTMLFormElement>('form[data-web3form]').forEach(bind);
}
