<script lang="ts">
  import { onMount } from 'svelte';

  // Form State
  let status = $state<'idle' | 'loading' | 'success' | 'error'>('idle');
  let formData = $state({
    fname: '',
    lname: '',
    email: '',
    project: '',
    message: ''
  });

  async function handleSubmit(e: Event) {
    e.preventDefault();
    status = 'loading';

    // We'll use Web3Forms (it's free and easy for static sites)
    // You just need a Public Access Key from https://web3forms.com/
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        access_key: "YOUR_ACCESS_KEY_HERE", // User needs to replace this
        from_name: `${formData.fname} ${formData.lname}`,
        ...formData
      })
    });

    const result = await response.json();
    if (result.success) {
      status = 'success';
      // Reset form
      formData = { fname: '', lname: '', email: '', project: '', message: '' };
    } else {
      status = 'error';
    }
  }

  onMount(() => {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  });
</script>

<section id="contact">
  <div class="contact-container">

    <div class="contact-left reveal">
      <p class="section-label">03 — Contact</p>
      <h2 class="section-title">Start een<br>project.</h2>
      <div class="contact-info-wrap reveal reveal-delay-1">
        <p class="contact-intro">Beschikbaar voor portretsessies en eventfotografie. Gevestigd in Brussel — bereid om te reizen.</p>
        <div class="contact-detail">
          <div>
            <div class="contact-item-label">Email</div>
            <a class="contact-item-value" href="mailto:info@tarchief.studio">info@tarchief.studio</a>
          </div>
          <div>
            <div class="contact-item-label">Instagram</div>
            <a class="contact-item-value" href="https://instagram.com/studioarchief" target="_blank" rel="noopener">@tarchief.studio</a>
          </div>
        </div>
      </div>
    </div>

    <form class="contact-form reveal reveal-delay-2" onsubmit={handleSubmit}>
      {#if status === 'success'}
        <div class="success-message" in:fade>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <h3>Bericht verzonden!</h3>
          <p>Bedankt voor je interesse. Ik neem zo snel mogelijk contact met je op.</p>
          <button type="button" class="btn-reset" onclick={() => status = 'idle'}>Nog een bericht sturen</button>
        </div>
      {:else}
        <div class="form-grid">
          <div class="form-row">
            <label class="form-label" for="fname">Voornaam</label>
            <input 
              class="form-input" 
              id="fname" 
              type="text" 
              placeholder="Marie" 
              required
              bind:value={formData.fname}
            >
          </div>
          <div class="form-row">
            <label class="form-label" for="lname">Achternaam</label>
            <input 
              class="form-input" 
              id="lname" 
              type="text" 
              placeholder="Dubois" 
              required
              bind:value={formData.lname}
            >
          </div>
        </div>
        <div class="form-row">
          <label class="form-label" for="email">E-mailadres</label>
          <input 
            class="form-input" 
            id="email" 
            type="email" 
            placeholder="marie@voorbeeld.be" 
            required
            bind:value={formData.email}
          >
        </div>
        <div class="form-row">
          <label class="form-label" for="project">Type project</label>
          <div class="select-wrap">
            <select 
              class="form-select" 
              id="project" 
              bind:value={formData.project} 
              class:is-placeholder={formData.project === ""}
              required
            >
              <option value="" disabled selected>Selecteer een type…</option>
              <option>Portretsessie</option>
              <option>Eventfotografie</option>
              <option>Anders</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <label class="form-label" for="message">Vertel me meer</label>
          <textarea 
            class="form-textarea" 
            id="message" 
            placeholder="Waar werk je aan, wanneer vindt het plaats, waar?" 
            required
            bind:value={formData.message}
          ></textarea>
        </div>

        {#if status === 'error'}
          <p class="error-text">Oeps! Er ging iets mis. Probeer het later opnieuw of stuur direct een mail.</p>
        {/if}

        <button class="btn-submit" type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Verzenden...' : 'Bericht verzenden'}
          {#if status !== 'loading'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          {/if}
        </button>
      {/if}
    </form>

  </div>
</section>

<style>
  #contact {
    position: relative;
    padding: 180px 56px;
    background: var(--bg-alt);
    overflow: hidden;
    transition: background 0.6s ease;
  }

  .contact-container {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 100px;
    align-items: start;
    max-width: 1200px;
    margin: 0 auto;
  }

  .contact-left {
    position: sticky;
    top: 140px;
  }

  .contact-intro {
    font-size: 16px;
    font-weight: 300;
    line-height: 1.7;
    color: var(--fg);
    opacity: 0.75;
    margin-bottom: 48px;
    max-width: 320px;
  }

  .contact-info-wrap {
    margin-top: 40px;
  }

  .contact-detail {
    display: flex;
    flex-direction: column;
    gap: 36px;
  }

  .contact-item-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--mid);
    margin-bottom: 10px;
    opacity: 0.85;
  }

  .contact-item-value {
    font-family: var(--brand);
    font-size: 24px;
    font-weight: 400;
    color: var(--fg);
    text-decoration: none;
    transition: color 0.2s, opacity 0.2s;
  }

  .contact-item-value:hover { color: var(--accent); }

  .contact-form {
    padding-top: 27px;
    min-height: 500px;
  }

  .success-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    height: 100%;
    padding: 40px;
    background: var(--bg);
    border: 1px solid var(--line);
  }

  .success-message svg {
    width: 48px;
    height: 48px;
    color: var(--accent);
    margin-bottom: 24px;
  }

  .success-message h3 {
    font-family: var(--brand);
    font-size: 32px;
    margin-bottom: 16px;
  }

  .success-message p {
    color: var(--mid);
    margin-bottom: 32px;
  }

  .btn-reset {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--accent);
    text-decoration: underline;
    cursor: pointer;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 40px;
  }

  .form-row {
    margin-bottom: 40px;
  }

  .form-label {
    display: block;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--fg);
    margin-bottom: 14px;
  }

  .form-input,
  .form-textarea {
    width: 100%;
    background: transparent;
    border: none;
    border-bottom: 1.5px solid var(--line);
    padding: 14px 0;
    font-family: var(--body);
    font-size: 16px;
    font-weight: 400;
    color: var(--fg);
    outline: none;
    transition: border-color 0.3s;
    appearance: none;
    border-radius: 0;
    box-sizing: border-box;
  }

  .select-wrap {
    border-bottom: 1.5px solid var(--line);
    transition: border-color 0.3s;
  }

  .select-wrap:focus-within {
    border-bottom-color: var(--fg);
  }

  .form-select {
    width: 100%;
    background: transparent;
    border: none;
    padding: 14px 0;
    font-family: var(--body);
    font-size: 16px;
    font-weight: 400;
    color: var(--fg);
    outline: none;
    appearance: none;
    -webkit-appearance: none;
    border-radius: 0;
    box-sizing: border-box;
    cursor: pointer;
  }

  .form-select.is-placeholder { opacity: 0.25; }

  .form-select option {
    background: var(--bg-alt);
    color: var(--fg);
  }

  .form-input:focus,
  .form-textarea:focus {
    border-bottom-color: var(--fg);
  }

  .form-textarea {
    resize: none;
    min-height: 120px;
  }

  .form-input::placeholder,
  .form-textarea::placeholder {
    color: var(--fg);
    opacity: 0.25;
  }

  .error-text {
    color: #ff4b2b;
    font-size: 13px;
    margin-bottom: 20px;
  }

  .btn-submit {
    display: inline-flex;
    align-items: center;
    gap: 16px;
    background: var(--fg);
    color: var(--bg);
    font-family: var(--body);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    padding: 22px 48px;
    border: none;
    cursor: pointer;
    transition: background 0.3s, gap 0.3s, transform 0.2s, color 0.3s;
    margin-top: 8px;
  }

  .btn-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-submit:hover:not(:disabled) {
    background: var(--accent);
    color: var(--fg);
    gap: 24px;
  }

  .btn-submit:active:not(:disabled) { transform: scale(0.98); }

  .btn-submit svg {
    width: 16px;
    height: 16px;
    transition: transform 0.3s;
  }

  .btn-submit:hover svg { transform: translateX(4px); }

  @media (max-width: 1024px) {
    #contact { padding: 100px 24px; }
    .contact-container { grid-template-columns: 1fr; gap: 64px; }
    .contact-left { position: static; }
    .contact-form { padding-top: 0; min-height: auto; }
    .form-grid { grid-template-columns: 1fr; gap: 0; }
  }
</style>