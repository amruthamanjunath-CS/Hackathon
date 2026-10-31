(function () {
  window.ML = window.ML || {}; ML.enter = ML.enter || {};
  let demo = false, current = null;
  const $ = s => document.querySelector(s);
  const todayKey = () => ML.dkey(Date.now());
  
  const isDoneToday = id => ML.state.events.some(e => e.type === 'reminder' && e.ref === id && e.status === 'done' && ML.dkey(e.ts) === todayKey());
  
  function pick() {
    const now = new Date(), hm = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    return ML.state.reminders.find(r => !isDoneToday(r.id) && (demo || r.time <= hm));
  }

  function render() {
    const box = $('#remBody'); 
    if (!box) return;
    
    current = pick();
    if (!current) {
      box.innerHTML = `
        <div class="text-center py-14 transition-all duration-300">
          <div class="inline-block p-6 bg-emerald-50 rounded-full mb-4 shadow-inner border border-emerald-100">
            <span class="text-6xl">🌿</span>
          </div>
          <p class="text-2xl font-extrabold text-stone-900 tracking-tight">All caught up for now!</p>
          <p class="text-stone-500 text-base mt-2">Nothing to do right now. You are doing wonderfully.</p>
        </div>
      `;
      if (typeof ML.say === 'function') ML.say('Nothing to do right now. You are doing well.');
      return;
    }

    box.innerHTML = `
      <div class="text-center py-8 px-4 transition-all duration-300">
        <div class="inline-block p-6 bg-amber-50 rounded-full mb-4 shadow-sm border border-amber-200 animate-bounce">
          <span class="text-7xl">${current.icon || '🔔'}</span>
        </div>
        
        <span class="bg-amber-100 text-amber-900 text-xs font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-wider inline-block mb-3 shadow-sm">
          Scheduled for ${current.time}
        </span>
        
        <h3 class="text-3xl font-extrabold text-stone-900 mb-2 tracking-tight">${current.label}</h3>
        <p class="text-stone-500 text-sm font-medium mb-8">Take your time. We are right here with you.</p>

        <div class="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
          <button class="btn yes bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold py-4 px-8 rounded-2xl text-lg shadow-lg shadow-emerald-600/20 transition-all cursor-pointer flex-1 flex items-center justify-center gap-2" id="yes">
            <span>✅</span> Yes, done
          </button>
          <button class="btn ghost bg-amber-100 hover:bg-amber-200 active:scale-95 text-amber-900 font-bold py-4 px-8 rounded-2xl text-lg shadow-sm transition-all cursor-pointer flex-1 flex items-center justify-center gap-2" id="later">
            <span>⏳</span> Not yet
          </button>
        </div>
      </div>
    `;

    if (typeof ML.say === 'function') ML.say(current.label + '. Have you done this?');
    
    const rid = current.id;
    
    const finish = (status, words) => {
      clearTimeout(ML.remTimer);
      
      if (typeof ML.log === 'function') {
        ML.log({ type: 'reminder', ref: rid, status });
      }
      
      box.innerHTML = `
        <div class="text-center py-14 transition-all duration-300">
          <div class="inline-block p-6 ${status === 'done' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'} rounded-full mb-4 shadow-inner border">
            <span class="text-6xl">${status === 'done' ? '😊' : '⏰'}</span>
          </div>
          <p class="text-2xl font-extrabold text-stone-900 tracking-tight">${words}</p>
        </div>
      `;
      if (typeof ML.say === 'function') ML.say(words); 
      demo = false;

      if (status === 'missed') {
        setTimeout(() => { render(); }, 5000);
      } else {
        setTimeout(() => { render(); }, 1500);
      }
    };

    const yesBtn = $('#yes');
    const laterBtn = $('#later');
    
    if (yesBtn) { yesBtn.onclick = () => finish('done', 'Thank you! Wonderful job.'); }
    if (laterBtn) { laterBtn.onclick = () => finish('missed', 'That is alright. We will gently check back in shortly.'); }
    
    ML.remTimer = setTimeout(() => finish('missed', 'Checking back in. Have you completed this?'), 30000);
  }

  ML.enter.remind = render;

  document.addEventListener('DOMContentLoaded', () => {
    const repeatBtn = $('#repeat');
    const demoBtn = $('#demoRem');

    if (repeatBtn) { repeatBtn.onclick = () => current && typeof ML.say === 'function' && ML.say(current.label + '. Have you done this?'); }
    if (demoBtn) { demoBtn.onclick = () => { demo = true; render(); }; }
  });
})();