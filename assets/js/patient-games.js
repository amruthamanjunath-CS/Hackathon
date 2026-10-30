// Gentle cognitive games for dementia care. No scores, no failure penalties; mistakes simply fade or reset gently.
(function () {
  window.ML = window.ML || {};
  const $ = s => document.querySelector(s);
  const praise = ['Lovely!', 'Well done!', 'That was nice.', 'Wonderful.'];
  
  // Safe show helper if ML.show isn't defined globally yet
  const showScreen = screenId => {
    if (typeof ML.show === 'function') {
      ML.show(screenId);
    } else {
      document.querySelectorAll('.screen').forEach(s => s.hidden = true);
      const target = document.getElementById(screenId);
      if (target) target.hidden = false;
    }
  };

  const finish = name => {
    if (typeof ML.log === 'function') ML.log({ type: 'game', name, status: 'done' });
    $('#gBoard').innerHTML = `
      <div class="text-center py-8">
        <p class="text-6xl mb-4">🌸</p>
        <p class="text-stone-700 font-bold text-lg mb-6">Wonderful job completing the game!</p>
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <button class="btn bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 px-6 rounded-2xl transition shadow-sm cursor-pointer" data-go="play">Play another</button>
          <button class="btn ghost bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold py-3.5 px-6 rounded-2xl transition shadow-sm cursor-pointer" data-go="home">Home</button>
        </div>
      </div>
    `;
    $('#gMsg').textContent = 'Thank you for playing.'; 
    if (typeof ML.say === 'function') ML.say('Thank you for playing. Well done.');
  };

  // Game 1: Matching Pairs
  function pairs() {
    showScreen('game'); 
    $('#gMsg').textContent = 'Find the matching pictures'; 
    if (typeof ML.say === 'function') ML.say('Find the matching pictures.');
    
    const set = ['🌻', '🐶', '🍎'], deck = set.concat(set).sort(() => Math.random() - .5);
    let open = [], lock = false, left = 3;
    
    $('#gBoard').innerHTML = '<div class="grid grid-cols-3 gap-4 max-w-sm mx-auto">' + deck.map((c, i) => `
      <button class="tile bg-amber-100 hover:bg-amber-200 text-3xl h-24 rounded-2xl shadow-sm border border-amber-200 transition flex items-center justify-center cursor-pointer" data-i="${i}" aria-label="card">❓</button>
    `).join('') + '</div>';
    
    document.querySelectorAll('.tile').forEach(t => t.onclick = () => {
      if (lock || t.classList.contains('up')) return;
      t.classList.add('up', 'bg-white'); 
      t.textContent = deck[t.dataset.i]; 
      open.push(t);
      
      if (open.length < 2) return;
      const [a, b] = open; open = [];
      
      if (deck[a.dataset.i] === deck[b.dataset.i]) { 
        left--; 
        $('#gMsg').textContent = praise[left % 4]; 
        if (!left) setTimeout(() => finish('Match pairs'), 900); 
      } else { 
        lock = true; 
        setTimeout(() => { 
          [a, b].forEach(x => { 
            x.classList.remove('up', 'bg-white'); 
            x.classList.add('bg-amber-100');
            x.textContent = '❓'; 
          }); 
          lock = false; 
        }, 1100); 
      }
    });
  }

  // Game 2: Which One?
  function which() {
    showScreen('game');
    const rounds = [
      ['Which one can you eat?', ['🍎', '🚗', '🪑'], '🍎'], 
      ['Which one goes on your feet?', ['🍌', '👟', '🔑'], '👟'], 
      ['Which one can you drink?', ['📕', '⚽', '🥛'], '🥛']
    ];
    let n = 0;
    
    (function next() {
      if (n === rounds.length) return finish('Which one?');
      const [q, opts, ans] = rounds[n]; 
      $('#gMsg').textContent = q; 
      if (typeof ML.say === 'function') ML.say(q);
      
      $('#gBoard').innerHTML = '<div class="grid grid-cols-3 gap-4 max-w-md mx-auto">' + opts.map(o => `
        <button class="tile bg-white hover:bg-amber-50 text-4xl h-28 rounded-2xl shadow-sm border border-stone-200 transition flex items-center justify-center cursor-pointer">${o}</button>
      `).join('') + '</div>';
      
      document.querySelectorAll('.tile').forEach(t => {
        t.onclick = () => {
          if (t.textContent === ans) { 
            $('#gMsg').textContent = praise[n]; 
            if (typeof ML.say === 'function') ML.say(praise[n]); 
            n++; 
            setTimeout(next, 1200); 
          } else { 
            t.classList.add('opacity-40', 'scale-95'); 
            if (typeof ML.say === 'function') ML.say('Have another look.'); 
          }
        };
      });
    })();
  }

  // Game 3: Synthetic Family Member Match (4-5 Photos matched with Names & Relationships)
  function familyMatch() {
    showScreen('game');
    $('#gMsg').textContent = 'Match each family member with their name';
    if (typeof ML.say === 'function') ML.say('Match each family member with their name.');

    // 5 Rich Synthetic Family Profiles with Photos, Names, and Relationships
    const syntheticFamily = [
      { id: '1', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2', name: 'Anagha', relation: 'Daughter' },
      { id: '2', photo: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb', name: 'Rahul', relation: 'Son' },
      { id: '3', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb', name: 'Neha', relation: 'Granddaughter' },
      { id: '4', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', name: 'Vikram', relation: 'Brother' },
      { id: '5', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9', name: 'Ananya', relation: 'Daughter-in-law' }
    ];

    let selectedPhoto = null;
    let matchedCount = 0;

    // Shuffle both columns independently so items don't align statically
    const photosShuffled = [...syntheticFamily].sort(() => Math.random() - 0.5);
    const namesShuffled = [...syntheticFamily].sort(() => Math.random() - 0.5);

    $('#gBoard').innerHTML = `
      <div class="grid grid-cols-2 gap-6 max-w-xl mx-auto items-center">
        <!-- Photos Column -->
        <div class="space-y-3">
          <p class="text-xs font-bold text-stone-400 uppercase tracking-wider text-center mb-1">Faces</p>
          ${photosShuffled.map(item => `
            <button class="photo-btn w-full bg-white border-2 border-stone-200 p-2 rounded-2xl shadow-sm flex items-center justify-center hover:border-teal-500 transition cursor-pointer group" data-id="${item.id}">
              <img src="${item.photo}" class="w-16 h-16 object-cover rounded-xl pointer-events-none shadow-sm group-hover:scale-105 transition-transform">
            </button>
          `).join('')}
        </div>
        <!-- Names & Relations Column -->
        <div class="space-y-3">
          <p class="text-xs font-bold text-stone-400 uppercase tracking-wider text-center mb-1">Names & Relation</p>
          ${namesShuffled.map(item => `
            <button class="name-btn w-full bg-white border-2 border-stone-200 py-3.5 px-3 rounded-2xl shadow-sm text-left hover:border-teal-500 transition cursor-pointer flex flex-col justify-center" data-id="${item.id}">
              <span class="font-extrabold text-stone-900 text-base">${item.name}</span>
              <span class="text-xs font-semibold text-teal-600">${item.relation}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    document.querySelectorAll('.photo-btn').forEach(btn => {
      btn.onclick = () => {
        if (btn.classList.contains('opacity-30')) return;
        document.querySelectorAll('.photo-btn').forEach(b => b.classList.remove('ring-4', 'ring-teal-400', 'border-teal-500'));
        btn.classList.add('ring-4', 'ring-teal-400', 'border-teal-500');
        selectedPhoto = btn.dataset.id;
        if (typeof ML.say === 'function') ML.say('Selected photo');
      };
    });

    document.querySelectorAll('.name-btn').forEach(btn => {
      btn.onclick = () => {
        if (!selectedPhoto || btn.classList.contains('opacity-30')) return;
        
        if (selectedPhoto === btn.dataset.id) {
          const pBtn = document.querySelector(`.photo-btn[data-id="${selectedPhoto}"]`);
          pBtn.classList.add('opacity-30', 'bg-emerald-50', 'border-emerald-400', 'pointer-events-none');
          pBtn.classList.remove('ring-4', 'ring-teal-400', 'border-teal-500');
          
          btn.classList.add('opacity-30', 'bg-emerald-50', 'border-emerald-400', 'pointer-events-none');
          
          selectedPhoto = null;
          matchedCount++;
          
          if (typeof ML.say === 'function') ML.say('Lovely match!');
          if (matchedCount === syntheticFamily.length) {
            setTimeout(() => finish('Family Match'), 1200);
          }
        } else {
          btn.classList.add('bg-amber-50', 'border-amber-300');
          setTimeout(() => btn.classList.remove('bg-amber-50', 'border-amber-300'), 800);
          if (typeof ML.say === 'function') ML.say('Have another look.');
        }
      };
    });
  }

  document.addEventListener('DOMContentLoaded', () => { 
    if ($('#g1')) $('#g1').onclick = pairs; 
    if ($('#g2')) $('#g2').onclick = which;
    if ($('#g3')) $('#g3').onclick = familyMatch;
  });
})();