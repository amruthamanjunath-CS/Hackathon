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
})();