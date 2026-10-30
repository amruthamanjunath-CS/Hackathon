// Spoken reminders the patient can confirm; persists or gently re-prompts until explicitly marked "Done".
(function () {
  window.ML = window.ML || {}; ML.enter = ML.enter || {};
  let demo = false, current = null;
  const $ = s => document.querySelector(s);
  const todayKey = () => ML.dkey(Date.now());
  
  // A reminder is only cleared for the day if it was explicitly marked as 'done'
  const isDoneToday = id => ML.state.events.some(e => e.type === 'reminder' && e.ref === id && e.status === 'done' && ML.dkey(e.ts) === todayKey());
  
  function pick() {
    const now = new Date(), hm = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    // Find the first reminder scheduled for today that has NOT been marked 'done' yet
    return ML.state.reminders.find(r => !isDoneToday(r.id) && (demo || r.time <= hm));
  }

  function render() {
    const box = $('#remBody'); 
    if (!box) return;
    
    current = pick();
    if (!current) {
      box.innerHTML = `
        <div class="text-center py-10">
          <p class="text-6xl mb-3">🌿</p>
          <p class="text-xl font-bold text-stone-800">Nothing to do right now.</p>
          <p class="text-sm text-stone-500 mt-1">You are doing well.</p>
        </div>
      `;
      if (typeof ML.say === 'function') ML.say('Nothing to do right now. You are doing well.');
      return;
    }

    box.innerHTML = `
      <div class="text-center py-6">
        <p class="text-7xl mb-4">${current.icon || '🔔'}</p>
        <p class="text-2xl font-extrabold text-stone-900 mb-2">${current.label}</p>
        <p class="text-sm text-amber-700 font-semibold mb-6">⏳ Waiting for your confirmation</p>
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <button class="btn yes bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-8 rounded-2xl text-lg shadow-md transition cursor-pointer" id="yes">✅ Yes, done</button>
          <button class="btn ghost bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold py-4 px-8 rounded-2xl text-lg shadow-md transition cursor-pointer" id="later">Not yet</button>
        </div>
      </div>
    `;

    if (typeof ML.say === 'function') ML.say(current.label + '. Have you done this?');
    
    const rid = current.id;
    
    const finish = (status, words) => {
      clearTimeout(ML.remTimer);
      
      // Log event to shared state
      if (typeof ML.log === 'function') {
        ML.log({ type: 'reminder', ref: rid, status });
      }
      
      box.innerHTML = `
        <div class="text-center py-10">
          <p class="text-6xl mb-3">${status === 'done' ? '😊' : '⏰'}</p>
          <p class="text-xl font-bold text-stone-800">${words}</p>
        </div>
      `;
      if (typeof ML.say === 'function') ML.say(words); 
      demo = false;

      // If the patient clicked "Not yet", keep the task active/pending. 
      // After a short pause (e.g., 5 seconds), it loops back and asks them again until they press "Yes, done".
      if (status === 'missed') {
        setTimeout(() => {
          render(); // Re-prompts the same task until done!
        }, 5000);
      }
    };

    const yesBtn = $('#yes');
    const laterBtn = $('#later');
    
    if (yesBtn) {
      yesBtn.onclick = () => finish('done', 'Thank you. Well done.');
    }
    if (laterBtn) {
      laterBtn.onclick = () => finish('missed', 'That is alright. We will check back with you shortly.');
    }
    
    // If left unattended, gently re-prompt after 30 seconds
    ML.remTimer = setTimeout(() => finish('missed', 'Checking back in. Have you completed this?'), 30000);
  }

  ML.enter.remind = render;

  document.addEventListener('DOMContentLoaded', () => {
    const repeatBtn = $('#repeat');
    const demoBtn = $('#demoRem');

    if (repeatBtn) {
      repeatBtn.onclick = () => current && typeof ML.say === 'function' && ML.say(current.label + '. Have you done this?');
    }
    if (demoBtn) {
      demoBtn.onclick = () => { demo = true; render(); };
    }
  });
})();