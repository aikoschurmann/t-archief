<script lang="ts">
  import { COPY, EMAIL, STUDIO, type Lang } from '../site';

  // A short booking form instead of only a mailto link, which fails on many work computers.
  // Sent through Web3Forms, like the old contact form; the key is public by design.
  let { lang = 'nl' }: { lang?: Lang } = $props();
  let t = $derived(COPY[lang].form);

  let status: 'idle' | 'sending' | 'sent' | 'failed' = $state('idle');

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const data = Object.fromEntries(new FormData(form));
    const key = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
    if (!key) {
      status = 'failed';
      return;
    }
    status = 'sending';
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: key,
          subject: `Boeking: ${data.type || 'shoot'} op ${data.date || '?'}`,
          from_name: `${data.name} via ${STUDIO}`,
          ...data
        })
      });
      const result = await response.json();
      status = result.success ? 'sent' : 'failed';
      if (result.success) form.reset();
    } catch {
      status = 'failed';
    }
  }
</script>

<form class="form" onsubmit={submit}>
  <!-- Every field is a cell with its name inside, like the rest of the site -->
  <input class="half" name="name" required autocomplete="name" placeholder={t.name} aria-label={t.name} />
  <input class="half" name="email" type="email" required autocomplete="email" placeholder={t.email} aria-label={t.email} />
  <input name="organisation" autocomplete="organization" placeholder={t.organisation} aria-label={t.organisation} />
  <input class="half" name="date" placeholder={t.date} aria-label={t.date} />
  <input class="half" name="place" placeholder={t.place} aria-label={t.place} />
  <select name="type" aria-label={t.type}>
    {#each t.types as type}
      <option>{type}</option>
    {/each}
  </select>
  <textarea name="purpose" rows="3" placeholder={t.intro} aria-label={t.purpose}></textarea>
  <!-- Spam trap that Web3Forms checks -->
  <input type="checkbox" name="botcheck" class="trap" tabindex="-1" autocomplete="off" />

  <button class="send" type="submit" disabled={status === 'sending'}>
    {status === 'sending' ? t.sending : `${t.send} →`}
  </button>
  {#if status === 'sent'}
    <p class="status">{t.sent}</p>
  {:else if status === 'failed'}
    <p class="status"><a href="mailto:{EMAIL}">{t.failed}</a></p>
  {/if}
</form>

<style>
  .form {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .status { width: 100%; font-size: var(--label); font-weight: 700; }

  input, select, textarea {
    width: 100%;
    min-height: var(--bar);
    padding: 0 6px;
    border: none;
    border-radius: 0;
    background: var(--cell);
    color: var(--fg);
    font: inherit;
    font-size: var(--label);
    font-weight: 700;
    line-height: 1;
    outline: none;
    transition: background var(--speed) var(--ease);
  }
  .half { width: calc(50% - 3px); }
  ::placeholder { color: var(--mid); opacity: 1; }
  input:focus, select:focus, textarea:focus { background: var(--cell-hover); }
  textarea { padding: 4px 6px; line-height: 1.3; resize: vertical; }
  select { appearance: none; cursor: pointer; }

  .trap { display: none; }

  .send {
    width: 100%;
    display: flex;
    align-items: center;
    min-height: var(--bar);
    padding: 0 6px;
    background: var(--fg);
    color: var(--bg);
    font-size: var(--label);
    font-weight: 700;
    cursor: pointer;
    transition: opacity var(--speed) var(--ease);
  }
  .send:hover { opacity: 0.5; }
  .send:disabled { opacity: 0.5; cursor: wait; }

  @media (max-width: 768px) {
    /* Below 16px iPhones zoom into the field */
    input, select, textarea { font-size: 16px; min-height: 32px; }
  }
</style>
