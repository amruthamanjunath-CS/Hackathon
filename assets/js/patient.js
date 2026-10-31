// Patient app shell: simple screen navigation and lifecycle management.
(function () {
  const $ = s => document.querySelector(s);
  ML.$ = $;
  ML.enter = ML.enter || {};
  
  // Show specific screen and handle cleanup (stop speech, clear timers, trigger enter hooks)
  ML.show = id => { 
    document.querySelectorAll('.screen').forEach(s => s.hidden = (s.id !== id)); 
    
    if (typeof ML.stopSay === 'function') ML.stopSay(); 
    clearTimeout(ML.remTimer); 
    
    if (ML.enter[id]) {
      try {
        ML.enter[id]();
      } catch (err) {
        console.error(`Error entering screen [${id}]:`, err);
      }
    }
  };

  // Home Screen Lifecycle
  ML.enter.home = () => {
    const h = new Date().getHours();
    const g = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
    
    const greetEl = $('#greet');
    if (greetEl) {
      greetEl.textContent = g + ' 🌞';
    }
    
    if (typeof ML.say === 'function') {
      ML.say(g + '. What would you like to do?');
    }
  };

  // Event listener for all data-go navigation buttons
  document.addEventListener('click', e => { 
    const b = e.target.closest('[data-go]'); 
    if (b && b.dataset.go) { 
      ML.show(b.dataset.go); 
    } 
  });

  // Initialize app on home screen
  document.addEventListener('DOMContentLoaded', () => {
    ML.show('home');
  });
  // Emergency SOS Action Handler for Patient Portal
document.addEventListener('click', e => {
  const sosBtn = e.target.closest('#patientEmergencyBtn');
  if (!sosBtn) return;

  if (typeof ML.say === 'function') {
    ML.say("Don't worry. We have notified your caregiver, and they are coming to help you right now.");
  }

  if (typeof ML.log === 'function') {
    ML.log({ 
      type: 'emergency', 
      ref: 'sos_alert', 
      status: 'triggered',
      note: 'Patient pressed the emergency help button from the main dashboard.' 
    });
  }

  const alertOverlay = document.createElement('div');
  alertOverlay.className = 'fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-6 z-50';
  alertOverlay.innerHTML = `
    <div class="bg-white border-4 border-rose-200 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl space-y-4">
      <div class="inline-block p-5 bg-rose-100 rounded-full text-5xl mb-2">🚨</div>
      <h3 class="text-3xl font-extrabold text-stone-900">Help is on the way</h3>
      <p class="text-stone-600 text-base leading-relaxed font-medium">An emergency notification has been sent to your caregiver. Please stay calm and remain where you are.</p>
      <button id="dismissSos" class="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-4 rounded-2xl text-lg transition cursor-pointer mt-4 shadow-md">
        I understand
      </button>
    </div>
  `;
  document.body.appendChild(alertOverlay);

  document.getElementById('dismissSos').onclick = () => {
    alertOverlay.remove();
  };
});
})();