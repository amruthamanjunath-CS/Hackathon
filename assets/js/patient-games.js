
(function () {
  window.ML = window.ML || {};
  const $ = s => document.querySelector(s);

  const praise = [
    'Lovely!',
    'Well done!',
    'That was nice.',
    'Wonderful.',
    'Splendid!'
  ];

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
    if (typeof ML.log === 'function') {
      ML.log({ type: 'game', name, status: 'done' });
    }

    $('#gBoard').innerHTML = `
      <div class="game-complete">
        <p class="complete-icon">🌸</p>
        <h2>Wonderful job completing the activity!</h2>
        <p>You did a fantastic job. Keep enjoying the games!</p>

        <div class="complete-actions">
          <button class="btn complete-play" data-go="play">
            Play another
          </button>

          <button class="btn complete-home" data-go="home">
            Home
          </button>
        </div>
      </div>
    `;

    $('#gMsg').textContent = 'Thank you for playing.';

    if (typeof ML.say === 'function') {
      ML.say('Thank you for completing the activity. Well done.');
    }
  };

  /* ==========================================
     1. MATCH PAIRS
  ========================================== */

  function pairs() {
    showScreen('game');

    $('#gMsg').textContent = 'Find all matching picture pairs';

    if (typeof ML.say === 'function') {
      ML.say('Find all matching picture pairs.');
    }

    const set = ['🌻', '🐶', '🍎', '🌊', '🏡', '🦋'];
    const deck = set.concat(set).sort(() => Math.random() - 0.5);

    let open = [];
    let lock = false;
    let left = set.length;

    $('#gBoard').innerHTML = `
      <div class="pairs-game">
        <div class="pairs-grid">
          ${deck.map((c, i) => `
            <button
              class="tile pairs-tile"
              data-i="${i}"
              aria-label="card"
            >❓</button>
          `).join('')}
        </div>
      </div>
    `;

    document.querySelectorAll('.pairs-tile').forEach(t => {
      t.onclick = () => {
        if (lock || t.classList.contains('up')) return;

        t.classList.add('up', 'bg-white');
        t.textContent = deck[t.dataset.i];
        open.push(t);

        if (open.length < 2) return;

        const [a, b] = open;
        open = [];

        if (deck[a.dataset.i] === deck[b.dataset.i]) {
          left--;

          $('#gMsg').textContent = praise[left % praise.length];

          if (!left) {
            setTimeout(() => finish('Match pairs'), 1000);
          }
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
      };
    });
  }

  /* ==========================================
     2. JIGSAW PUZZLE
  ========================================== */

  function jigsawPuzzle() {
    showScreen('game');

    $('#gMsg').textContent = 'Complete the scenic puzzle';

    if (typeof ML.say === 'function') {
      ML.say('Complete the scenic puzzle by placing each piece.');
    }

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
      <div class="jigsaw-game">

        <div class="jigsaw-section">
          <p class="game-subheading">🧩 Picture Board</p>
          <p class="game-hint">
            Choose the correct place for each picture.
          </p>

          <div class="puzzle-grid" id="slotContainer">
            ${shuffledSlots.map(slot => `
              <div
                class="puzzle-slot"
                data-target="${slot.id}"
              >
                <span>${slot.label[0]}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="jigsaw-section">
          <p class="game-subheading">🌻 Available Pieces</p>
          <p class="game-hint">
            Tap a picture, then tap its matching slot.
          </p>

          <div class="puzzle-grid" id="pieceContainer">
            ${shuffledPieces.map(piece => `
              <button
                class="puzzle-piece"
                data-id="${piece.id}"
              >
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

        document.querySelectorAll('.puzzle-piece').forEach(b => {
          b.classList.remove(
            'ring-4',
            'ring-teal-400',
            'border-teal-500',
            'bg-teal-50'
          );
        });

        btn.classList.add(
          'ring-4',
          'ring-teal-400',
          'border-teal-500',
          'bg-teal-50'
        );

        selectedPiece = btn.dataset.id;

        if (typeof ML.say === 'function') {
          ML.say('Selected piece');
        }
      };
    });

    document.querySelectorAll('.puzzle-slot').forEach(slot => {
      slot.onclick = () => {
        if (!selectedPiece || slot.classList.contains('filled')) return;

        if (slot.dataset.target === selectedPiece) {
          const pieceObj = pieces.find(p => p.id === selectedPiece);

          slot.innerHTML = `<span class="placed-icon">${pieceObj.icon}</span>`;

          slot.classList.add('filled');
          slot.classList.remove('border-dashed');

          const usedBtn = document.querySelector(
            `.puzzle-piece[data-id="${selectedPiece}"]`
          );

          usedBtn.classList.add('opacity-30', 'pointer-events-none');

          usedBtn.classList.remove(
            'ring-4',
            'ring-teal-400',
            'border-teal-500',
            'bg-teal-50'
          );

          selectedPiece = null;
          placedCount++;

          if (typeof ML.say === 'function') {
            ML.say('Great placement!');
          }

          if (placedCount === pieces.length) {
            setTimeout(() => finish('Jigsaw Puzzle'), 1200);
          }
        } else {
          slot.classList.add('wrong-slot');

          setTimeout(() => {
            slot.classList.remove('wrong-slot');
          }, 800);

          if (typeof ML.say === 'function') {
            ML.say('Try another spot.');
          }
        }
      };
    });
  }

  /* ==========================================
     3. FAMILY MATCH
  ========================================== */

  function familyMatch() {
    showScreen('game');

    $('#gMsg').textContent = 'Match all family members with their names';

    if (typeof ML.say === 'function') {
      ML.say('Match all family members with their names.');
    }

    const syntheticFamily = [
      {
        id: '1',
        photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
        name: 'Anagha',
        relation: 'Daughter'
      },
      {
        id: '2',
        photo: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
        name: 'Rahul',
        relation: 'Son'
      },
      {
        id: '3',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
        name: 'Neha',
        relation: 'Granddaughter'
      },
      {
        id: '4',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
        name: 'Vikram',
        relation: 'Brother'
      },
      {
        id: '5',
        photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9',
        name: 'Ananya',
        relation: 'Daughter-in-law'
      }
    ];

    let selectedPhoto = null;
    let matchedCount = 0;

    const photosShuffled = [...syntheticFamily].sort(
      () => Math.random() - 0.5
    );

    const namesShuffled = [...syntheticFamily].sort(
      () => Math.random() - 0.5
    );

    $('#gBoard').innerHTML = `
      <div class="family-game">

        <div class="family-column">
          <p class="game-subheading">👨‍👩‍👧 Family Photos</p>
          <p class="game-hint">Select a family photo.</p>

          ${photosShuffled.map(item => `
            <button
              class="photo-btn"
              data-id="${item.id}"
            >
              <img
                src="${item.photo}"
                class="family-photo"
                alt="Family member"
              >
            </button>
          `).join('')}
        </div>

        <div class="family-column">
          <p class="game-subheading">📝 Names & Relations</p>
          <p class="game-hint">Choose the matching name.</p>

          ${namesShuffled.map(item => `
            <button
              class="name-btn"
              data-id="${item.id}"
            >
              <span class="family-name">${item.name}</span>
              <span class="family-relation">${item.relation}</span>
            </button>
          `).join('')}
        </div>

      </div>
    `;

    document.querySelectorAll('.photo-btn').forEach(btn => {
      btn.onclick = () => {
        if (btn.classList.contains('opacity-30')) return;

        document.querySelectorAll('.photo-btn').forEach(b => {
          b.classList.remove(
            'ring-4',
            'ring-teal-400',
            'border-teal-500'
          );
        });

        btn.classList.add(
          'ring-4',
          'ring-teal-400',
          'border-teal-500'
        );

        selectedPhoto = btn.dataset.id;

        if (typeof ML.say === 'function') {
          ML.say('Selected photo');
        }
      };
    });

    document.querySelectorAll('.name-btn').forEach(btn => {
      btn.onclick = () => {
        if (!selectedPhoto || btn.classList.contains('opacity-30')) return;

        if (selectedPhoto === btn.dataset.id) {
          const pBtn = document.querySelector(
            `.photo-btn[data-id="${selectedPhoto}"]`
          );

          pBtn.classList.add(
            'opacity-30',
            'bg-emerald-50',
            'border-emerald-400',
            'pointer-events-none'
          );

          pBtn.classList.remove(
            'ring-4',
            'ring-teal-400',
            'border-teal-500'
          );

          btn.classList.add(
            'opacity-30',
            'bg-emerald-50',
            'border-emerald-400',
            'pointer-events-none'
          );

          selectedPhoto = null;
          matchedCount++;

          if (typeof ML.say === 'function') {
            ML.say('Lovely match!');
          }

          if (matchedCount === syntheticFamily.length) {
            setTimeout(() => finish('Family Match'), 1200);
          }
        } else {
          btn.classList.add('wrong-match');

          setTimeout(() => {
            btn.classList.remove('wrong-match');
          }, 800);

          if (typeof ML.say === 'function') {
            ML.say('Have another look.');
          }
        }
      };
    });
  }

  /* ==========================================
     START GAME BUTTONS
  ========================================== */

  document.addEventListener('DOMContentLoaded', () => {
    if ($('#g1')) $('#g1').onclick = pairs;
    if ($('#g2')) $('#g2').onclick = jigsawPuzzle;
    if ($('#g3')) $('#g3').onclick = familyMatch;
  });

})();
