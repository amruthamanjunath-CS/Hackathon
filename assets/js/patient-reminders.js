// Spoken reminders the patient can confirm; postponed ones reschedule in 10 minutes and log as missed for caregivers.
(function () {
  window.ML = window.ML || {}; ML.enter = ML.enter || {};
  let demo = false, current = null;
  const $ = s => document.querySelector(s);
  const todayKey = () => ML.dkey(Date.now());
  
  // Checks if a reminder was already completed (done) today
  const isDoneToday = id => ML.state.events.some(e => e.type === 'reminder' && e.ref === id && e.status === 'done' && ML.dkey(e.ts) === todayKey());
  
  function pick() {
    const now = new Date(), hm = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    // Find reminders that haven't been successfully completed today yet
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
        <p class="text-2xl font-extrabold text-stone-900 mb-8">${current.label}</p>
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

      // If patient clicked "Not yet" or timed out, remind again after 10 minutes (600,000 ms)
      if (status === 'missed') {
        setTimeout(() => {
          render(); // Re-trigger reminder prompt after 10 mins
        }, 10 * 60 * 1000);
      }
    };

    const yesBtn = $('#yes');
    const laterBtn = $('#later');
    
    if (yesBtn) {
      yesBtn.onclick = () => finish('done', 'Thank you. Well done.');
    }
    if (laterBtn) {
      laterBtn.onclick = () => finish('missed', 'That is alright. We will gently remind you again in a little while.');
    }
    
    // Automated timeout if left unanswered for 30 seconds -> treats as missed and schedules retry
    ML.remTimer = setTimeout(() => finish('missed', 'That is alright. We will gently remind you again soon.'), 30000);
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