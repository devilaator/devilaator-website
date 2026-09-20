(() => {
  'use strict';
  const login = document.querySelector('#admin-login');
  const form = document.querySelector('#admin-login-form');
  const inbox = document.querySelector('#admin-inbox');
  const signin = document.querySelector('#admin-signin');
  const signout = document.querySelector('#admin-signout');
  const loginStatus = document.querySelector('#admin-login-status');
  const inboxStatus = document.querySelector('#admin-inbox-status');
  const messages = document.querySelector('#admin-messages');
  const userEmail = document.querySelector('#admin-user-email');
  const refresh = document.querySelector('#admin-refresh');
  const more = document.querySelector('#admin-more');
  const labels = { new: 'UUS', read: 'LOETUD', replied: 'VASTATUD' };
  const pageSize = 50;
  let client, user, generation = 0, offset = 0, loading = false, authenticating = false, signingOut = false;
  const requests = new Set();

  function clearInbox() {
    generation++;
    requests.forEach(controller => controller.abort());
    requests.clear();
    user = null;
    loading = false;
    offset = 0;
    messages.replaceChildren();
    userEmail.textContent = '';
    inboxStatus.textContent = '';
    more.hidden = true;
    inbox.hidden = true;
    login.hidden = false;
  }

  async function query(build) {
    const controller = new AbortController();
    requests.add(controller);
    const timer = setTimeout(() => controller.abort(), 20000);
    try { return await build(controller.signal); }
    finally { clearTimeout(timer); requests.delete(controller); }
  }

  function showError(error) {
    console.error('Supabase admin error:', error);
    inboxStatus.textContent = error?.code === '42501' || error?.status === 403
      ? 'Postkasti ligipääs keelatud. Kontrolli administraatori SELECT- ja UPDATE-õigusi Supabase’i RLS-seadistuses.'
      : 'Postkasti päring ebaõnnestus. Kontrolli ühendust ja Supabase’i õigusi ning proovi uuesti.';
  }

  function textElement(tag, value, className) {
    const element = document.createElement(tag);
    element.textContent = String(value ?? '');
    if (className) element.className = className;
    return element;
  }

  function renderMessage(message) {
    const card = document.createElement('article');
    card.className = 'message-card';
    const date = new Date(message.created_at);
    const time = textElement('time', Number.isNaN(date.getTime()) ? 'Kuupäev puudub' : date.toLocaleString('et-EE'), 'message-date');
    if (!Number.isNaN(date.getTime())) time.dateTime = date.toISOString();
    const badge = textElement('span', labels[message.status] || String(message.status ?? 'Teadmata'), 'status-badge');
    badge.dataset.status = message.status;
    const meta = document.createElement('div');
    meta.className = 'message-meta';
    meta.append(time, badge);
    const heading = textElement('h2', message.name);
    const email = textElement('a', message.email);
    // Kodeerimine väldib sisestatud e-posti kasutamist mailto päiste või HTML-ina.
    email.href = `mailto:${encodeURIComponent(String(message.email ?? ''))}`;
    const content = textElement('p', message.message, 'admin-message-text');
    const actions = document.createElement('div');
    actions.className = 'admin-message-actions';
    const reply = textElement('button', 'Vasta', 'btn admin-action');
    reply.type = 'button';
    reply.setAttribute('aria-expanded', 'false');
    const replyForm = document.createElement('form');
    replyForm.className = 'admin-reply-form';
    replyForm.hidden = true;
    const subject = 'Re: DEVILAATOR kontaktvorm';
    const recipient = textElement('p', `Saaja: ${message.email}`);
    const subjectLine = textElement('p', `Teema: ${subject}`);
    const field = document.createElement('label');
    field.className = 'contact-field';
    field.append(textElement('span', 'Vastus'));
    const textarea = document.createElement('textarea');
    textarea.rows = 7;
    textarea.required = true;
    field.append(textarea);
    const replyActions = document.createElement('div');
    replyActions.className = 'admin-message-actions';
    const send = textElement('button', 'Saada vastus', 'btn admin-action');
    send.type = 'submit';
    const cancel = textElement('button', 'Tühista', 'btn admin-action');
    cancel.type = 'button';
    replyActions.append(send, cancel);
    replyForm.append(recipient, subjectLine, field, replyActions);
    const replyStatus = textElement('p', '', 'admin-reply-status');
    replyStatus.setAttribute('role', 'status');
    replyStatus.setAttribute('aria-live', 'polite');
    let replySending = false;
    reply.addEventListener('click', () => {
      if (!user || card.getAttribute('aria-busy') === 'true') return;
      replyForm.hidden = false;
      reply.setAttribute('aria-expanded', 'true');
      textarea.focus();
    });
    cancel.addEventListener('click', () => {
      if (replySending) return;
      replyForm.hidden = true;
      reply.setAttribute('aria-expanded', 'false');
      reply.focus();
    });
    replyForm.addEventListener('submit', async event => {
      event.preventDefault();
      if (!user || replySending || card.getAttribute('aria-busy') === 'true') return;
      const replyText = textarea.value.trim();
      if (!replyText) {
        replyStatus.textContent = 'Palun kirjuta vastus.';
        textarea.focus();
        return;
      }
      const version = generation;
      const buttons = [...card.querySelectorAll('button')];
      replySending = true;
      card.setAttribute('aria-busy', 'true');
      buttons.forEach(button => { button.disabled = true; });
      textarea.readOnly = true;
      send.textContent = 'Saadan...';
      replyStatus.textContent = 'Saadan vastust…';
      let sent = false;
      try {
        const { data, error } = await query(signal => client.functions.invoke('clever-endpoint', {
          body: { to: message.email, name: message.name, subject, message: replyText },
          signal
        }));
        if (error) throw error;
        if (data?.error || data?.success === false) throw new Error('Edge Function reported a send failure.');
        sent = true;
        if (version !== generation || !user) return;
        replyStatus.textContent = 'Vastus saadetud.';
        textarea.value = '';
        replyForm.hidden = true;
        reply.setAttribute('aria-expanded', 'false');
        // Staatust muudame ainult pärast Edge Functioni edukat vastust.
        const { data: updated, error: updateError } = await query(signal => client.from('contact_messages')
          .update({ status: 'replied' }).eq('id', message.id).select('id,status').single().abortSignal(signal));
        if (updateError) throw updateError;
        if (!updated || updated.status !== 'replied') throw new Error('Reply status update was not confirmed.');
        if (version !== generation || !user) return;
        message.status = updated.status;
        badge.textContent = labels[updated.status];
        badge.dataset.status = updated.status;
      } catch (error) {
        console.error('Supabase admin reply error:', error);
        if (version !== generation || !user) return;
        replyStatus.textContent = sent
          ? 'Vastus saadetud. Staatuse salvestamine ebaõnnestus; kasuta nuppu „Märgi vastatuks”. Vastust pole vaja uuesti saata.'
          : 'Vastuse saatmist ei õnnestunud kinnitada. Kontrolli ühendust ja proovi hiljem uuesti. Ühenduse katkemisel võis kiri siiski kohale jõuda.';
      } finally {
        replySending = false;
        buttons.forEach(button => { button.disabled = false; });
        textarea.readOnly = false;
        send.textContent = 'Saada vastus';
        card.removeAttribute('aria-busy');
      }
    });
    actions.append(reply);
    for (const [status, label] of [['read', 'Märgi loetuks'], ['replied', 'Märgi vastatuks']]) {
      const button = textElement('button', label, 'btn admin-action');
      button.type = 'button';
      button.addEventListener('click', async () => {
        if (!user || card.getAttribute('aria-busy') === 'true') return;
        const version = generation;
        const buttons = [...actions.querySelectorAll('button')];
        buttons.forEach(item => { item.disabled = true; });
        card.setAttribute('aria-busy', 'true');
        inboxStatus.textContent = 'Salvestan staatust…';
        try {
          // Ainult status muutub; id filter piirab muudatuse ühe sõnumiga.
          const { data, error } = await query(signal => client.from('contact_messages')
            .update({ status }).eq('id', message.id).select('id,status').single().abortSignal(signal));
          if (version !== generation || !user) return;
          if (error) throw error;
          if (!data || data.status !== status) throw new Error('Status update was not confirmed.');
          message.status = data.status;
          badge.textContent = labels[data.status] || data.status;
          badge.dataset.status = data.status;
          inboxStatus.textContent = 'Staatus uuendatud.';
        } catch (error) { if (version === generation && user) showError(error); }
        finally {
          buttons.forEach(item => { item.disabled = false; });
          card.removeAttribute('aria-busy');
        }
      });
      actions.append(button);
    }
    const deleteButton = textElement('button', 'Kustuta', 'btn admin-action admin-delete');
    deleteButton.type = 'button';
    deleteButton.addEventListener('click', async () => {
      if (!user || loading || card.getAttribute('aria-busy') === 'true') return;
      if (!window.confirm('Kas oled kindel, et soovid selle sõnumi kustutada?')) return;
      const version = generation;
      const buttons = [...actions.querySelectorAll('button')];
      buttons.forEach(button => { button.disabled = true; });
      card.setAttribute('aria-busy', 'true');
      inboxStatus.textContent = 'Kustutan sõnumit…';
      try {
        const { data, error } = await query(signal => client.from('contact_messages')
          .delete().eq('id', message.id).select('id').single().abortSignal(signal));
        if (version !== generation || !user) return;
        if (error) throw error;
        // RLS võib keelatud kustutamise korral tagastada null rida ilma HTTP veata.
        if (!data || String(data.id) !== String(message.id)) throw new Error('Delete was not confirmed.');
        card.remove();
        offset = Math.max(0, offset - 1);
        inboxStatus.textContent = 'Sõnum kustutatud.';
      } catch (error) {
        if (version !== generation || !user) return;
        console.error('Supabase admin delete error:', error);
        inboxStatus.textContent = 'Sõnumi kustutamine ei õnnestunud. Kontrolli internetiühendust ja administraatori DELETE-õigust Supabase’is ning proovi uuesti.';
      } finally {
        buttons.forEach(button => { button.disabled = false; });
        card.removeAttribute('aria-busy');
      }
    });
    actions.append(deleteButton);
    card.append(meta, heading, email, content, actions, replyForm, replyStatus);
    return card;
  }

  async function loadMessages(reset = true) {
    if (!user || loading) return;
    const version = generation;
    loading = true;
    refresh.disabled = true;
    more.disabled = true;
    if (reset) { offset = 0; messages.replaceChildren(); more.hidden = true; }
    inboxStatus.textContent = 'Laadin sõnumeid…';
    try {
      const { data, error } = await query(signal => client.from('contact_messages')
        .select('id,created_at,name,email,message,status')
        .order('created_at', { ascending: false }).order('id', { ascending: false })
        .range(offset, offset + pageSize - 1).abortSignal(signal));
      if (version !== generation || !user) return;
      if (error) throw error;
      data.forEach(message => messages.append(renderMessage(message)));
      offset += data.length;
      more.hidden = data.length < pageSize;
      inboxStatus.textContent = offset ? `Kuvatud sõnumeid: ${offset}.` : 'Sõnumeid pole või sellel kontol puudub RLS-i lugemisõigus.';
    } catch (error) { if (version === generation && user) showError(error); }
    finally {
      if (version === generation) {
        loading = false;
        refresh.disabled = false;
        more.disabled = false;
      }
    }
  }

  async function verifySession() {
    const version = generation;
    try {
      const { data, error } = await client.auth.getUser();
      if (version !== generation || signingOut) return;
      if (error || !data.user) { clearInbox(); return; }
      if (user?.id === data.user.id) { userEmail.textContent = data.user.email || ''; return; }
      clearInbox();
      user = data.user;
      userEmail.textContent = user.email || '';
      login.hidden = true;
      inbox.hidden = false;
      form.reset();
      await loadMessages();
    } catch (error) {
      if (version !== generation) return;
      clearInbox();
      loginStatus.textContent = 'Seansi kontroll ebaõnnestus. Palun logi uuesti sisse.';
    }
  }

  try {
    const config = window.DEVILAATOR_SUPABASE_CONFIG;
    if (!config?.url || !config.key || typeof window.supabase?.createClient !== 'function') throw new Error('Supabase configuration or CDN is unavailable.');
    client = window.supabase.createClient(config.url, config.key, {
      db: { schema: 'public' },
      auth: { persistSession: true, storage: window.sessionStorage, storageKey: 'devilaator-admin-auth', autoRefreshToken: true, detectSessionInUrl: false }
    });
    // Ära tee Supabase'i asünkroonseid päringuid otse Auth callback'i sees.
    client.auth.onAuthStateChange((event, session) => {
      if (!session || event === 'SIGNED_OUT') { clearInbox(); return; }
      if (!signingOut) setTimeout(verifySession, 0);
    });
    signin.disabled = false;
  } catch (error) {
    console.error('Supabase admin error:', error);
    loginStatus.textContent = 'Sisselogimine pole praegu saadaval. Kontrolli Supabase’i seadistust ja CDN-i laadimist.';
    return;
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (authenticating || signingOut) return;
    authenticating = true;
    signin.disabled = true;
    loginStatus.textContent = 'Login sisse…';
    try {
      const { error } = await client.auth.signInWithPassword({ email: form.elements.email.value.trim(), password: form.elements.password.value });
      if (error) throw error;
      form.elements.password.value = '';
      loginStatus.textContent = '';
      await verifySession();
    } catch (error) {
      console.error('Supabase admin error:', error);
      loginStatus.textContent = 'Sisselogimine ebaõnnestus. Kontrolli e-posti, parooli ja internetiühendust.';
      form.elements.password.value = '';
    } finally { authenticating = false; signin.disabled = false; }
  });

  signout.addEventListener('click', async () => {
    if (signingOut) return;
    signingOut = true;
    signin.disabled = true;
    clearInbox();
    loginStatus.textContent = 'Login välja…';
    try {
      const { error } = await client.auth.signOut({ scope: 'local' });
      if (error) throw error;
      loginStatus.textContent = 'Oled välja logitud.';
    } catch (error) {
      // Ka võrguvea korral eemalda selle vahekaardi kohalik seanss ja sõnumid.
      sessionStorage.removeItem('devilaator-admin-auth');
      location.replace('/admin.html');
    } finally { signingOut = false; signin.disabled = false; }
  });
  refresh.addEventListener('click', () => loadMessages());
  more.addEventListener('click', () => loadMessages(false));
  // BFCache'ist taastamisel ära näita enne kontrolli vanu sõnumeid.
  addEventListener('pagehide', clearInbox);
  addEventListener('pageshow', event => { if (event.persisted) verifySession(); });
})();
