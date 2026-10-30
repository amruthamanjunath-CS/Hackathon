// Caregiver tools: edit reminders, upload album photos and voice notes, demo controls.
(function () {
  const $ = s => document.querySelector(s);
  const readFile = f => new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(f); });
  const shrink = src => new Promise(res => { const i = new Image(); i.onload = () => { const k = Math.min(1, 800 / i.width), c = document.createElement('canvas'); c.width = i.width * k; c.height = i.height * k; c.getContext('2d').drawImage(i, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', .8)); }; i.src = src; });
  
  function lists() {
    // Render Reminders List with Tailwind styling
    $('#remList').innerHTML = ML.state.reminders.map(r => `
      <div class="item flex items-center justify-between bg-stone-50 border border-stone-200 p-3.5 rounded-2xl mb-2">
        <div class="flex items-center gap-3">
          <span class="text-xl bg-stone-200/60 p-2 rounded-xl">${r.icon}</span>
          <div>
            <span class="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200">${r.time}</span>
            <p class="text-stone-800 font-semibold text-sm mt-0.5">${r.label}</p>
          </div>
        </div>
        <button class="btn ghost text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200 transition cursor-pointer" data-rem="${r.id}">Remove</button>
      </div>
    `).join('') || '<p class="text-stone-400 text-sm italic">No reminders scheduled.</p>';
    
    // Render Album List with Tailwind styling
    $('#albList').innerHTML = ML.state.album.map(p => `
      <div class="item flex items-center justify-between bg-stone-50 border border-stone-200 p-3.5 rounded-2xl mb-2">
        <div class="flex items-center gap-3">
          <img src="${p.photo}" alt="" class="w-12 h-12 object-cover rounded-xl shadow-sm border border-stone-200">
          <div>
            <p class="text-stone-800 font-semibold text-sm">${p.question}${p.audio ? ' <span title="Voice note attached">🎙️</span>' : ''}</p>
          </div>
        </div>
        <button class="btn ghost text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200 transition cursor-pointer" data-alb="${p.id}">Remove</button>
      </div>
    `).join('') || '<p class="text-stone-400 text-sm italic">No photos added yet.</p>';
  }

  const all = () => { lists(); ML.renderDashboard(); };
  const sync = () => { try { const s = JSON.parse(localStorage.getItem('memorylane.v1')); if (s) ML.state = s; } catch (e) {} all(); };
  
  document.addEventListener('click', e => {
    const r = e.target.closest('[data-rem]'), p = e.target.closest('[data-alb]');
    if (r) { ML.state.reminders = ML.state.reminders.filter(x => x.id !== r.dataset.rem); ML.save(); all(); }
    if (p) { ML.state.album = ML.state.album.filter(x => x.id !== p.dataset.alb); ML.save(); all(); }
  });

  $('#remForm').onsubmit = e => {
    e.preventDefault();
    const l = $('#rLabel').value.trim();
    ML.state.reminders.push({ id: 'r' + Date.now(), time: $('#rTime').value, label: l, short: l.slice(0, 24), icon: '🔔' });
    ML.state.reminders.sort((a, b) => a.time.localeCompare(b.time)); 
    ML.save(); 
    e.target.reset(); 
    all();
  };

  $('#albForm').onsubmit = async e => {
    e.preventDefault();
    const photo = await shrink(await readFile($('#aPhoto').files[0]));
    const af = $('#aAudio').files[0], audio = af ? await readFile(af) : null;
    ML.state.album.push({ id: 'a' + Date.now(), photo, caption: $('#aCap').value, question: $('#aQ').value, audio });
    if (ML.save()) { 
      e.target.reset(); 
      all(); 
    }
  };

  $('#reseed').onclick = () => { ML.reset(); all(); };
  $('#clear').onclick = () => { ML.clearEvents(); all(); };
  $('#refresh').onclick = sync;
  
  window.addEventListener('focus', sync);
  all();
})();