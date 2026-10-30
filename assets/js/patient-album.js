// Patient memory album: allows patients to gently look through family photos, answer questions, and hear voice notes.
(function () {
  window.ML = window.ML || {}; 
  ML.enter = ML.enter || {};
  const $ = s => document.querySelector(s);

  function renderAlbum() {
    const box = $('#albBody');
    if (!box) return;

    const albumList = ML.state && ML.state.album ? ML.state.album : [];

    if (albumList.length === 0) {
      box.innerHTML = `
        <div class="text-center py-12">
          <p class="text-6xl mb-3">🖼️</p>
          <p class="text-xl font-bold text-stone-800">No photos in the album yet.</p>
          <p class="text-sm text-stone-500 mt-1">Your caregiver can add family photos from the dashboard.</p>
        </div>
      `;
      if (typeof ML.say === 'function') ML.say('No photos in the album yet.');
      return;
    }

    // Render interactive album grid or cards for the patient
    box.innerHTML = `
      <div class="max-w-xl mx-auto space-y-6">
        <div class="text-center mb-6">
          <h2 class="text-2xl font-extrabold text-stone-900">Family Memory Lane</h2>
          <p class="text-stone-500 text-sm mt-1">Tap a photo to remember and hear who is with you.</p>
        </div>
        
        <div class="space-y-6" id="albumCardsContainer">
          ${albumList.map((item, index) => `
            <div class="bg-white border-2 border-stone-200 rounded-3xl p-6 shadow-sm album-card transition-all" data-id="${item.id}">
              <div class="flex flex-col sm:flex-row gap-6 items-center">
                <img src="${item.photo}" alt="Memory photo" class="w-40 h-40 object-cover rounded-2xl shadow-md border border-stone-100 flex-shrink-0">
                <div class="flex-1 text-center sm:text-left space-y-3">
                  <span class="bg-teal-50 text-teal-800 text-xs font-extrabold px-3 py-1 rounded-full border border-teal-200 inline-block">Memory #${index + 1}</span>
                  <p class="text-xl font-bold text-stone-800 question-text">${item.question}</p>
                  
                  <!-- Hidden details revealed on tap -->
                  <div class="reveal-section hidden space-y-3 pt-2 border-t border-stone-100">
                    <p class="text-stone-600 font-medium caption-text bg-amber-50 p-3 rounded-xl border border-amber-200 text-sm">${item.caption}</p>
                    ${item.audio ? `<audio controls class="w-full mt-2"><source src="${item.audio}" type="audio/mp3">Your browser does not support audio.</audio>` : ''}
                  </div>

                  <button class="reveal-btn bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-sm transition cursor-pointer">
                    Tap to remember 💭
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    if (typeof ML.say === 'function') {
      ML.say('Here is your photo memory album. Tap any photo to explore.');
    }

    // Attach interaction logic to reveal captions and log album views
    document.querySelectorAll('.album-card').forEach(card => {
      const btn = card.querySelector('.reveal-btn');
      const revealSec = card.querySelector('.reveal-section');
      const questionText = card.querySelector('.question-text');
      const photoId = card.dataset.id;
      const itemData = albumList.find(x => x.id === photoId);

      btn.onclick = () => {
        const isHidden = revealSec.classList.contains('hidden');
        if (isHidden) {
          revealSec.classList.remove('hidden');
          btn.textContent = 'Hide details';
          btn.className = 'reveal-btn bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-sm px-5 py-2.5 rounded-xl transition cursor-pointer';
          
          // Speak caption aloud
          if (itemData && itemData.caption && typeof ML.say === 'function') {
            ML.say(itemData.caption);
          }

          // Log the activity to sync with the caregiver dashboard engagement chart
          if (typeof ML.log === 'function') {
            ML.log({ type: 'album', ref: photoId, status: 'done' });
          }
        } else {
          revealSec.classList.add('hidden');
          btn.textContent = 'Tap to remember 💭';
          btn.className = 'reveal-btn bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-sm transition cursor-pointer';
        }
      };
    });
  }

  // Bind to ML.enter lifecycle used by patient.js
  ML.enter.album = renderAlbum;
})();