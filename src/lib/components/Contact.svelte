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
  let errors = $state<Record<string, string>>({});

  function validate() {
    errors = {};
    if (!formData.fname.trim()) errors.fname = 'Verplicht';
    if (!formData.lname.trim()) errors.lname = 'Verplicht';
    if (!formData.email.trim()) {
      errors.email = 'Verplicht';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Ongeldig e-mailadres';
    }
    if (!formData.project) errors.project = 'Verplicht';
    
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!validate()) return;
    
    status = 'loading';

    const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
    
    if (!accessKey || accessKey === "YOUR_ACCESS_KEY_HERE") {
      console.error("Web3Forms Access Key is missing. Please add VITE_WEB3FORMS_ACCESS_KEY to your .env file.");
      status = 'error';
      return;
    }

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          access_key: accessKey,
          from_name: `${formData.fname} ${formData.lname}`,
          ...formData
        })
      });

      const result = await response.json();
      if (result.success) {
        status = 'success';
        // Reset form
        formData = { fname: '', lname: '', email: '', project: '', message: '' };
        setTimeout(() => {
          status = 'idle';
        }, 5000);
      } else {
        console.error("Web3Forms Error:", result.message);
        status = 'error';
      }
    } catch (err) {
      console.error("Form Submission Error:", err);
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
          <div class="contact-item">
            <div class="contact-item-label">Email</div>
            <a class="contact-item-value" href="mailto:info@tarchief.studio">info@tarchief.studio</a>
          </div>
          <div class="contact-item">
            <div class="contact-item-label">Instagram</div>
            <a class="contact-item-value" href="https://instagram.com/tarchief.studio" target="_blank" rel="noopener">@tarchief.studio</a>
          </div>
        </div>
      </div>
    </div>

    <form class="contact-form reveal reveal-delay-2" onsubmit={handleSubmit} novalidate>
      <div class="form-grid">
        <div class="form-row">
          <label class="form-label" for="fname">Voornaam</label>
          {#if errors.fname}<span class="field-error">{errors.fname}</span>{/if}
          <input 
            class="form-input" 
            class:has-error={errors.fname}
            id="fname" 
            type="text" 
            placeholder="Marie" 
            bind:value={formData.fname}
            oninput={() => errors.fname = ''}
          >
        </div>
        <div class="form-row">
          <label class="form-label" for="lname">Achternaam</label>
          {#if errors.lname}<span class="field-error">{errors.lname}</span>{/if}
          <input 
            class="form-input" 
            class:has-error={errors.lname}
            id="lname" 
            type="text" 
            placeholder="Dubois" 
            bind:value={formData.lname}
            oninput={() => errors.lname = ''}
          >
        </div>
      </div>
      <div class="form-row">
        <label class="form-label" for="email">E-mailadres</label>
        {#if errors.email}<span class="field-error">{errors.email}</span>{/if}
        <input 
          class="form-input" 
          class:has-error={errors.email}
          id="email" 
          type="email" 
          placeholder="marie@voorbeeld.be" 
          bind:value={formData.email}
          oninput={() => errors.email = ''}
        >
      </div>
      <div class="form-row">
        <label class="form-label" for="project">Type project</label>
        {#if errors.project}<span class="field-error">{errors.project}</span>{/if}
        <div class="select-wrap" class:has-error={errors.project}>
          <select 
            class="form-select" 
            id="project" 
            bind:value={formData.project} 
            class:is-placeholder={formData.project === ""}
            onchange={() => errors.project = ''}
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
        {#if errors.message}<span class="field-error">{errors.message}</span>{/if}
        <textarea 
          class="form-textarea" 
          class:has-error={errors.message}
          id="message" 
          placeholder="Waar werk je aan, wanneer vindt het plaats, waar?" 
          bind:value={formData.message}
          oninput={() => errors.message = ''}
        ></textarea>
      </div>

      {#if status === 'error'}
        <p class="error-text">Oeps! Er ging iets mis. Probeer het later opnieuw of stuur direct een mail.</p>
      {/if}

      <button class="btn-submit" type="submit" disabled={status === 'loading' || status === 'success'} class:is-success={status === 'success'}>
        {#if status === 'loading'}
          Verzenden...
        {:else if status === 'success'}
          Bericht verzonden
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        {:else}
          Bericht verzenden
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        {/if}
      </button>
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
    position: relative;
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
    padding-top: 36px; /* Pushes the form down so it aligns with the h2, matching the About section */
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 40px;
  }

  .form-row {
    margin-bottom: 40px;
    position: relative;
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

  .field-error {
    position: absolute;
    right: 0;
    top: 0;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #ff4b2b;
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

  .form-input.has-error,
  .form-textarea.has-error,
  .select-wrap.has-error {
    border-bottom-color: #ff4b2b;
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

  .btn-submit.is-success {
    background: #2e7d32;
    color: #fff;
    opacity: 1;
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

  .btn-submit:hover:not(.is-success) svg { transform: translateX(4px); }

  @media (max-width: 1024px) {
    #contact { padding: 80px 24px; }
    .contact-container { 
      grid-template-columns: 1fr; 
      gap: 64px; 
      text-align: left;
      max-width: 500px;
      margin: 0 auto;
    }
    .contact-left { position: static; }
    .contact-intro { font-size: 15px; margin-left: 0; margin-right: 0; }
    .contact-detail { flex-direction: row; justify-content: flex-start; flex-wrap: wrap; gap: 40px; }
    .contact-item { display: flex; flex-direction: column; align-items: flex-start; }
    .contact-item-value { font-size: 18px; }
    .contact-form { padding-top: 0; min-height: auto; text-align: left; }
    .form-grid { grid-template-columns: 1fr; gap: 0; }
    .btn-submit { width: 100%; justify-content: center; }
  }

  @media (max-width: 380px) {
    #contact { padding: 60px 16px; }
    .contact-container { gap: 40px; }
    .contact-intro { font-size: 14px; }
    .contact-detail { gap: 24px; }
    .contact-item-value { font-size: 16px; }
    .form-row { margin-bottom: 24px; }
    .form-label { font-size: 9px; letter-spacing: 0.1em; }
    .btn-submit { padding: 16px 24px; font-size: 10px; }
  }
</style>