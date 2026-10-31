// Patient Family Photo Albums
(function () {
  window.ML = window.ML || {};
  ML.enter = ML.enter || {};

  const $ = selector => document.querySelector(selector);

  let currentAlbumId = null;
  let currentPhotos = [];
  let currentPhotoIndex = 0;

  function getAlbums() {
    const state = ML.state || {};
    const photos = state.album || [];
    const savedAlbums = state.albums || [];
    const groups = new Map();

    // Create groups from saved album records.
    savedAlbums.forEach(album => {
      groups.set(String(album.id), {
        id: String(album.id),
        name: album.name || 'Family Memories',
        coverPhotoId: album.coverPhotoId || null,
        audio: album.audio || null,
        photos: []
      });
    });

    // Add photos to their matching albums.
    photos.forEach(photo => {
      const id = String(photo.albumId || 'family-memories');

      if (!groups.has(id)) {
        groups.set(id, {
          id,
          name: photo.albumName || 'Family Memories',
          coverPhotoId: null,
          audio: null,
          photos: []
        });
      }

      groups.get(id).photos.push(photo);
    });

    return Array.from(groups.values()).filter(
      album => album.photos.length > 0
    );
  }

  function getCover(album) {
    return album.photos.find(
      photo => String(photo.id) === String(album.coverPhotoId)
    ) || album.photos[0];
  }

  // Supports older albums where audio was saved with each photo.
  function getAlbumAudio(album) {
    if (album.audio) return album.audio;

    const oldPhotoWithAudio = album.photos.find(photo => photo.audio);
    return oldPhotoWithAudio ? oldPhotoWithAudio.audio : null;
  }

  function renderAlbum() {
    const box = $('#albBody');
    if (!box) return;

    currentAlbumId = null;

    const albums = getAlbums();

    if (!albums.length) {
      box.innerHTML = `
        <div class="album-empty">
          <div class="empty-icon">📸</div>
          <h2>Your Family Albums</h2>
          <p>No albums have been added yet.</p>
          <span>Your caregiver can create albums and add family photos.</span>
        </div>
      `;

      if (typeof ML.say === 'function') {
        ML.say('There are no family albums yet.');
      }
      return;
    }

    box.innerHTML = `
      <div class="album-page">

        <div class="album-heading">
          <span class="album-eyebrow">♡ YOUR SPECIAL MOMENTS ♡</span>
          <h2>Our Family Albums</h2>
          <p>Choose an album to revisit your memories.</p>

          <div class="album-count">
            📷 ${albums.length} Albums
          </div>
        </div>

        <div class="memory-album-grid">
          ${albums.map(album => {
            const cover = getCover(album);

            return `
              <button
                class="memory-album-card"
                data-open-album="${album.id}"
                type="button"
              >
                <div class="memory-album-cover">
                  <img
                    src="${cover.photo}"
                    alt="${album.name}"
                    loading="lazy"
                  >

                  <span class="memory-photo-count">
                    📷 ${album.photos.length}
                  </span>
                </div>

                <div class="memory-album-info">
                  <h3>${album.name}</h3>
                  <p>${album.photos.length} special moments</p>
                  <span>Open Album →</span>
                </div>
              </button>
            `;
          }).join('')}
        </div>

        <div class="album-footer">
          💗 Made with love, filled with memories.
        </div>

      </div>
    `;

    box.querySelectorAll('[data-open-album]').forEach(button => {
      button.onclick = () => {
        currentAlbumId = button.dataset.openAlbum;
        renderPhotos();
      };
    });

    if (typeof ML.say === 'function') {
      ML.say('Choose a family album to explore.');
    }
  }

  // Album page: one audio player at the top, followed by all photos.
  function renderPhotos() {
    const box = $('#albBody');

    const album = getAlbums().find(
      item => String(item.id) === String(currentAlbumId)
    );

    if (!box || !album) {
      renderAlbum();
      return;
    }

    currentPhotos = album.photos;
    currentPhotoIndex = 0;

    const albumAudio = getAlbumAudio(album);

    box.innerHTML = `
      <div class="album-page">

        <button
          class="album-back-btn"
          id="backToAlbums"
          type="button"
        >
          ← All Albums
        </button>

        <div class="album-heading">
          <span class="album-eyebrow">♡ YOUR MEMORIES ♡</span>
          <h2>${album.name}</h2>
          <p>Every picture tells a special story.</p>

          <div class="album-count">
            📷 ${album.photos.length} Photos
          </div>
        </div>

        ${albumAudio ? `
          <div class="album-voice-note">
            <p>🎙️ Listen to your family story</p>
            <audio controls preload="none">
              <source src="${albumAudio}">
              Your browser does not support audio.
            </audio>
          </div>
        ` : ''}

        <div class="memory-photo-grid">
          ${album.photos.map((photo, index) => `
            <button
              class="memory-photo-card"
              data-photo-index="${index}"
              type="button"
            >
              <img
                src="${photo.photo}"
                alt="Memory ${index + 1}"
                loading="lazy"
              >

              <span>View Memory</span>
            </button>
          `).join('')}
        </div>

      </div>
    `;

    $('#backToAlbums').onclick = renderAlbum;

    box.querySelectorAll('[data-photo-index]').forEach(button => {
      button.onclick = () => {
        currentPhotoIndex = Number(button.dataset.photoIndex);
        renderPhotoDetail();
      };
    });

    if (typeof ML.say === 'function') {
      ML.say(`Here are the photos from ${album.name}.`);
    }
  }

  // Individual photo detail: no audio player here.
  function renderPhotoDetail() {
    const box = $('#albBody');
    const photo = currentPhotos[currentPhotoIndex];

    if (!box || !photo) return;

    const album = getAlbums().find(
      item => String(item.id) === String(currentAlbumId)
    );

    box.innerHTML = `
      <div class="album-page">

        <button
          class="album-back-btn"
          id="backToPhotos"
          type="button"
        >
          ← Back to ${album ? album.name : 'Album'}
        </button>

        <div class="photo-detail">

          <div class="photo-detail-image">
            <img src="${photo.photo}" alt="Family memory">
          </div>

          <div class="photo-detail-content">

            <span class="album-eyebrow">♡ A SPECIAL MOMENT ♡</span>

            <h2>${photo.question || 'A beautiful memory'}</h2>

            <div class="album-caption">
              <span>💛</span>
              <p>${photo.caption || 'A special family memory.'}</p>
            </div>

            <div class="photo-navigation">

              <button
                id="previousPhoto"
                type="button"
                ${currentPhotoIndex === 0 ? 'disabled' : ''}
              >
                ← Previous
              </button>

              <span>
                ${currentPhotoIndex + 1} of ${currentPhotos.length}
              </span>

              <button
                id="nextPhoto"
                type="button"
                ${currentPhotoIndex === currentPhotos.length - 1 ? 'disabled' : ''}
              >
                Next →
              </button>

            </div>
          </div>
        </div>
      </div>
    `;

    $('#backToPhotos').onclick = renderPhotos;

    $('#previousPhoto').onclick = () => {
      if (currentPhotoIndex > 0) {
        currentPhotoIndex--;
        renderPhotoDetail();
      }
    };

    $('#nextPhoto').onclick = () => {
      if (currentPhotoIndex < currentPhotos.length - 1) {
        currentPhotoIndex++;
        renderPhotoDetail();
      }
    };

    if (typeof ML.say === 'function') {
      ML.say(photo.caption || photo.question || 'Here is a family memory.');
    }

    if (typeof ML.log === 'function') {
      ML.log({
        type: 'album',
        ref: photo.id,
        status: 'done'
      });
    }
  }

  ML.enter.album = renderAlbum;
  ML.renderAlbum = renderAlbum;
})();