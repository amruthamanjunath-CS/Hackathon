(function () {
  window.ML = window.ML || {};
  const $ = s => document.querySelector(s);
  const praise = ['Lovely!', 'Well done!', 'That was nice.', 'Wonderful.', 'Splendid!'];
  
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
        <p class="text-stone-800 font-extrabold text-xl mb-6">Wonderful job completing the activity!</p>
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <button class="btn bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 px-6 rounded-2xl transition shadow-sm cursor-pointer" data-go="play">Play another</button>
          <button class="btn ghost bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold py-3.5 px-6 rounded-2xl transition shadow-sm cursor-pointer" data-go="home">Home</button>
        </div>
      </div>
    `;
    $('#gMsg').textContent = 'Thank you for playing.'; 
    if (typeof ML.say === 'function') ML.say('Thank you for completing the activity. Well done.');
  };

  function pairs() {
    showScreen('game'); 
    $('#gMsg').textContent = 'Find all matching picture pairs'; 
    if (typeof ML.say === 'function') ML.say('Find all matching picture pairs.');
    
    const set = ['🌻', '🐶', '🍎', '🌊', '🏡', '🦋'];
    const deck = set.concat(set).sort(() => Math.random() - .5);
    let open = [], lock = false, left = set.length;
    
    $('#gBoard').innerHTML = '<div class="grid grid-cols-4 gap-3 max-w-md mx-auto">' + deck.map((c, i) => `
      <button class="tile bg-amber-100 hover:bg-amber-200 text-3xl h-20 rounded-2xl shadow-sm border border-amber-200 transition flex items-center justify-center cursor-pointer" data-i="${i}" aria-label="card">❓</button>
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
        $('#gMsg').textContent = praise[left % praise.length]; 
        if (!left) setTimeout(() => finish('Match pairs'), 1000); 
      } else { 
        lock = true; 
        setTimeout(() => { 
          [a, b].forEach(x => { 
            x.classList.remove('up', 'bg-white'); 
            x.classList.add('bg-amber-100');
            x.textContent = '❓'; 
          }); 
          lock = false; 
        }, 1000); 
      }
    });
  }

  function jigsawPuzzle() {
    showScreen('game');
    $('#gMsg').textContent = 'Complete the scenic puzzle';
    if (typeof ML.say === 'function') ML.say('Complete the scenic puzzle by placing each piece.');

    const pieces = [
      { id: 'p1', icon: '🌻', label: 'Sunflower' },
      { id: 'p2', icon: '🏡', label: 'Cottage' },
      { id: 'p3', icon: '🦋', label: 'Butterfly' },
      { id: 'p4', icon: '🌳', label: 'Tree' },
      { id: 'p5', icon: '🌊', label: 'River' },
      { id: 'p6', icon: '🐦', label: 'Bird' }
    ];

    let selectedPiece = null;
    let placedCount = 0;

    const shuffledPieces = [...pieces].sort(() => Math.random() - 0.5);
    const shuffledSlots = [...pieces].sort(() => Math.random() - 0.5);

    $('#gBoard').innerHTML = `
      <div class="space-y-6 max-w-lg mx-auto">
        <div>
          <p class="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Picture Board (Target Slots)</p>
          <div class="grid grid-cols-6 gap-2" id="slotContainer">
            ${shuffledSlots.map(slot => `
              <div class="puzzle-slot bg-stone-100 border-2 border-dashed border-stone-300 h-16 rounded-xl flex flex-col items-center justify-center text-2xl transition cursor-pointer" data-target="${slot.id}">
                <span class="text-[10px] text-stone-400 font-bold">${slot.label[0]}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div>
          <p class="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Available Pieces (Tap to pick)</p>
          <div class="grid grid-cols-6 gap-2" id="pieceContainer">
            ${shuffledPieces.map(piece => `
              <button class="puzzle-piece bg-white hover:bg-teal-50 border-2 border-stone-200 h-16 rounded-xl shadow-sm text-2xl flex items-center justify-center transition cursor-pointer" data-id="${piece.id}">
                ${piece.icon}
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    document.querySelectorAll('.puzzle-piece').forEach(btn => {
      btn.onclick = () => {
        if (btn.classList.contains('opacity-30')) return;
        document.querySelectorAll('.puzzle-piece').forEach(b => b.classList.remove('ring-4', 'ring-teal-400', 'border-teal-500', 'bg-teal-50'));
        btn.classList.add('ring-4', 'ring-teal-400', 'border-teal-500', 'bg-teal-50');
        selectedPiece = btn.dataset.id;
        if (typeof ML.say === 'function') ML.say('Selected piece');
      };
    });

    document.querySelectorAll('.puzzle-slot').forEach(slot => {
      slot.onclick = () => {
        if (!selectedPiece || slot.classList.contains('filled')) return;

        if (slot.dataset.target === selectedPiece) {
          const pieceObj = pieces.find(p => p.id === selectedPiece);
          slot.innerHTML = `<span class="text-2xl">${pieceObj.icon}</span>`;
          slot.classList.add('filled', 'bg-emerald-50', 'border-emerald-400', 'border-solid');
          slot.classList.remove('border-dashed', 'bg-stone-100');

          const usedBtn = document.querySelector(`.puzzle-piece[data-id="${selectedPiece}"]`);
          usedBtn.classList.add('opacity-30', 'pointer-events-none');
          usedBtn.classList.remove('ring-4', 'ring-teal-400', 'border-teal-500', 'bg-teal-50');

          selectedPiece = null;
          placedCount++;

          if (typeof ML.say === 'function') ML.say('Great placement!');
          if (placedCount === pieces.length) {
            setTimeout(() => finish('Jigsaw Puzzle'), 1200);
          }
        } else {
          slot.classList.add('bg-amber-50', 'border-amber-300');
          setTimeout(() => slot.classList.remove('bg-amber-50', 'border-amber-300'), 800);
          if (typeof ML.say === 'function') ML.say('Try another spot.');
        }
      };
    });
  }

  function familyMatch() {
    showScreen('game');
    $('#gMsg').textContent = 'Match all family members with their names';
    if (typeof ML.say === 'function') ML.say('Match all family members with their names.');

    const syntheticFamily = [
      { id: '1', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2', name: 'Anagha', relation: 'Daughter' },
      { id: '2', photo: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb', name: 'Rahul', relation: 'Son' },
      { id: '3', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb', name: 'Neha', relation: 'Granddaughter' },
      { id: '4', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', name: 'Vikram', relation: 'Brother' },
      { id: '5', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9', name: 'Ananya', relation: 'Daughter-in-law' }
    ];

    let selectedPhoto = null;
    let matchedCount = 0;

    const photosShuffled = [...syntheticFamily].sort(() => Math.random() - 0.5);
    const namesShuffled = [...syntheticFamily].sort(() => Math.random() - 0.5);

    $('#gBoard').innerHTML = `
      <div class="grid grid-cols-2 gap-6 max-w-xl mx-auto items-center">
        <div class="space-y-2.5">
          <p class="text-xs font-bold text-stone-400 uppercase tracking-wider text-center mb-1">Faces</p>
          ${photosShuffled.map(item => `
            <button class="photo-btn w-full bg-white border-2 border-stone-200 p-2 rounded-2xl shadow-sm flex items-center justify-center hover:border-teal-500 transition cursor-pointer group" data-id="${item.id}">
              <img src="${item.photo}" class="w-14 h-14 object-cover rounded-xl pointer-events-none shadow-sm group-hover:scale-105 transition-transform">
            </button>
          `).join('')}
        </div>
        <div class="space-y-2.5">
          <p class="text-xs font-bold text-stone-400 uppercase tracking-wider text-center mb-1">Names & Relation</p>
          ${namesShuffled.map(item => `
            <button class="name-btn w-full bg-white border-2 border-stone-200 py-3 px-3 rounded-2xl shadow-sm text-left hover:border-teal-500 transition cursor-pointer flex flex-col justify-center" data-id="${item.id}">
              <span class="font-extrabold text-stone-900 text-sm">${item.name}</span>
              <span class="text-[11px] font-semibold text-teal-600">${item.relation}</span>
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
    if ($('#g2')) $('#g2').onclick = jigsawPuzzle;
    if ($('#g3')) $('#g3').onclick = familyMatch;
  });
})();