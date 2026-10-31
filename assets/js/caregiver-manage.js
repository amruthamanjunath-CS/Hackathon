// Caregiver tools: reminders, multiple photo albums and one voice note per album.
(function () {
  const $ = selector => document.querySelector(selector);

  const readFile = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const shrink = src => new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const scale = Math.min(1, 800 / img.width);
      const canvas = document.createElement('canvas');

      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);

      canvas.getContext('2d').drawImage(
        img, 0, 0, canvas.width, canvas.height
      );

      resolve(canvas.toDataURL('image/jpeg', 0.75));
    };

    img.onerror = reject;
    img.src = src;
  });

  function ensureState() {
    ML.state = ML.state || {};
    ML.state.reminders = ML.state.reminders || [];
    ML.state.album = ML.state.album || [];
    ML.state.albums = ML.state.albums || [];
  }

  function saveAndRender() {
    if (typeof ML.save === 'function') {
      ML.save();
    }
    all();
  }

  function lists() {
    ensureState();

    const remListEl = $('#remList');
    const albListEl = $('#albList');

    if (remListEl) {
      remListEl.innerHTML = ML.state.reminders.map(reminder => `
        <div class="item flex items-center justify-between bg-stone-50 border border-stone-200 p-3.5 rounded-2xl mb-2">
          <div class="flex items-center gap-3">
            <span class="text-xl bg-stone-200/60 p-2 rounded-xl">${reminder.icon || '🔔'}</span>
            <div>
              <span class="text-xs font-bold text-teal-700">${reminder.time}</span>
              <p class="text-stone-800 font-semibold text-sm">${reminder.label}</p>
            </div>
          </div>

          <button
            type="button"
            class="btn ghost text-xs font-bold text-rose-600 px-3 py-1.5 rounded-xl"
            data-rem="${reminder.id}"
          >
            Remove
          </button>
        </div>
      `).join('') || '<p class="text-stone-400 text-sm">No reminders scheduled.</p>';
    }

    if (albListEl) {
      const photos = ML.state.album;
      const albums = ML.state.albums;
      const groups = new Map();

      albums.forEach(album => {
        groups.set(String(album.id), {
          album,
          photos: []
        });
      });

      photos.forEach(photo => {
        const id = String(photo.albumId || 'family-memories');

        if (!groups.has(id)) {
          groups.set(id, {
            album: {
              id,
              name: photo.albumName || 'Family Memories',
              coverPhotoId: null,
              audio: null
            },
            photos: []
          });
        }

        groups.get(id).photos.push(photo);
      });

      const visibleGroups = Array.from(groups.values())
        .filter(group => group.photos.length > 0);

      albListEl.innerHTML = visibleGroups.map(group => {
        const album = group.album;
        const albumPhotos = group.photos;

        return `
          <div class="caregiver-album-group">
            <h4>
              ${album.name} (${albumPhotos.length} photos)
              ${album.audio ? ' 🎙️ Audio added' : ''}
            </h4>

            ${albumPhotos.map(photo => {
              const isCover =
                String(photo.id) === String(album.coverPhotoId);

              return `
                <div class="item flex items-center justify-between gap-3 bg-white border border-stone-200 p-3 rounded-2xl mb-2">
                  <div class="flex items-center gap-3 min-w-0">
                    <img
                      src="${photo.photo}"
                      alt=""
                      class="w-12 h-12 object-cover rounded-xl shrink-0"
                    >

                    <div class="min-w-0">
                      <p class="text-stone-800 font-semibold text-sm">
                        ${photo.question || 'Family photo'}
                      </p>

                      ${isCover ? '<span class="cover-tag">ALBUM COVER</span>' : ''}
                    </div>
                  </div>

                  <button
                    type="button"
                    class="btn ghost text-xs font-bold text-rose-600 px-3 py-1.5 rounded-xl shrink-0"
                    data-alb="${photo.id}"
                  >
                    Remove
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        `;
      }).join('') || '<p class="text-stone-400 text-sm italic">No albums created yet.</p>';
    }
  }

  function all() {
    lists();

    if (typeof ML.renderDashboard === 'function') {
      ML.renderDashboard();
    }
  }

  function sync() {
    try {
      const saved = JSON.parse(localStorage.getItem('memorylane.v1'));

      if (saved) {
        ML.state = saved;
      }
    } catch (error) {
      console.error('Could not load saved Memory Lane data:', error);
    }

    ensureState();
    all();
  }

  // Reminder and photo removal.
  document.addEventListener('click', event => {
    const reminderButton = event.target.closest('[data-rem]');
    const photoButton = event.target.closest('[data-alb]');

    if (reminderButton) {
      ensureState();

      ML.state.reminders = ML.state.reminders.filter(
        item => String(item.id) !== reminderButton.dataset.rem
      );

      saveAndRender();
    }

    if (photoButton) {
      ensureState();

      const photoId = photoButton.dataset.alb;
      const removedPhoto = ML.state.album.find(
        item => String(item.id) === String(photoId)
      );

      ML.state.album = ML.state.album.filter(
        item => String(item.id) !== String(photoId)
      );

      if (removedPhoto) {
        const album = ML.state.albums.find(
          item => String(item.id) === String(removedPhoto.albumId)
        );

        if (album && String(album.coverPhotoId) === String(photoId)) {
          const replacement = ML.state.album.find(
            item => String(item.albumId) === String(removedPhoto.albumId)
          );

          album.coverPhotoId = replacement ? replacement.id : null;
        }

        const remaining = ML.state.album.some(
          item => String(item.albumId) === String(removedPhoto.albumId)
        );

        if (!remaining) {
          ML.state.albums = ML.state.albums.filter(
            item => String(item.id) !== String(removedPhoto.albumId)
          );
        }
      }

      saveAndRender();
    }
  });

  // Add reminder.
  const remForm = $('#remForm');

  if (remForm) {
    remForm.onsubmit = event => {
      event.preventDefault();
      ensureState();

      const label = $('#rLabel').value.trim();

      if (!label) return;

      ML.state.reminders.push({
        id: 'r' + Date.now(),
        time: $('#rTime').value,
        label,
        short: label.slice(0, 24),
        icon: '🔔'
      });

      ML.state.reminders.sort(
        (a, b) => a.time.localeCompare(b.time)
      );

      if (typeof ML.save === 'function') ML.save();

      remForm.reset();
      $('#rTime').value = '10:00';
      all();
    };
  }

  // Preview selected photos and build cover selector.
  const photoInput = $('#aPhoto');
  const previewBox = $('#albumUploadPreview');
  const coverSelect = $('#aCover');

  if (photoInput) {
    photoInput.addEventListener('change', () => {
      const files = Array.from(photoInput.files || [])
        .filter(file => file.type.startsWith('image/'));

      if (previewBox) {
        previewBox.innerHTML = files.map((file, index) => `
          <div class="relative">
            <img
              src="${URL.createObjectURL(file)}"
              alt="Selected photo ${index + 1}"
              class="album-upload-thumb"
            >
            <span class="text-xs text-stone-500">Photo ${index + 1}</span>
          </div>
        `).join('');
      }

      if (coverSelect) {
        coverSelect.innerHTML = files.map((file, index) => `
          <option value="${index}">
            Photo ${index + 1}${index === 0 ? ' (default)' : ''}
          </option>
        `).join('');
      }
    });
  }

  // Create an album with multiple photos and one album-level audio.
  const albForm = $('#albForm');

  if (albForm) {
    albForm.onsubmit = async event => {
      event.preventDefault();
      ensureState();

      const albumName = $('#aAlbum').value.trim();
      const photoFiles = Array.from($('#aPhoto').files || [])
        .filter(file => file.type.startsWith('image/'));

      if (!albumName) {
        alert('Please enter an album name.');
        return;
      }

      if (!photoFiles.length) {
        alert('Please select at least one photo.');
        return;
      }

      if (photoFiles.length > 20) {
        alert('Please upload no more than 20 photos in one album.');
        return;
      }

      const submitButton = albForm.querySelector('button[type="submit"]');

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Creating album...';
      }

      try {
        const albumId = 'album-' + Date.now();
        const coverIndex = Number($('#aCover')?.value || 0);

        const caption = $('#aCap').value.trim();
        const question = $('#aQ').value.trim();

        // Read the audio only once for the entire album.
        const audioFile = $('#aAudio')?.files[0];
        const albumAudio = audioFile ? await readFile(audioFile) : null;

        const uploadedPhotos = [];

        for (let index = 0; index < photoFiles.length; index++) {
          const original = await readFile(photoFiles[index]);
          const compressed = await shrink(original);

          uploadedPhotos.push({
            id: 'photo-' + Date.now() + '-' + index,
            albumId,
            albumName,
            photo: compressed,
            caption,
            question
          });
        }

        const safeCoverIndex = Math.min(
          Math.max(coverIndex, 0),
          uploadedPhotos.length - 1
        );

        const albumRecord = {
          id: albumId,
          name: albumName,
          coverPhotoId: uploadedPhotos[safeCoverIndex].id,
          audio: albumAudio
        };

        ML.state.albums.push(albumRecord);
        ML.state.album.push(...uploadedPhotos);

        if (typeof ML.save === 'function') {
          ML.save();
        }

        albForm.reset();

        if (previewBox) previewBox.innerHTML = '';

        if (coverSelect) {
          coverSelect.innerHTML =
            '<option value="0">First photo (default)</option>';
        }

        all();

        alert(`"${albumName}" created with ${uploadedPhotos.length} photos.`);
      } catch (error) {
        console.error('Album upload failed:', error);
        alert('Unable to create the album. The photos may be too large for browser storage. Try fewer or smaller photos.');
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = 'Create Album';
        }
      }
    };
  }

  // Demo controls.
  const reseedBtn = $('#reseed');
  const clearBtn = $('#clear');
  const refreshBtn = $('#refresh');

  if (reseedBtn) {
    reseedBtn.onclick = () => {
      if (typeof ML.reset === 'function') ML.reset();
      sync();
    };
  }

  if (clearBtn) {
    clearBtn.onclick = () => {
      if (typeof ML.clearEvents === 'function') ML.clearEvents();
      sync();
    };
  }

  if (refreshBtn) {
    refreshBtn.onclick = sync;
  }

  window.addEventListener('focus', sync);

  ensureState();
  all();
})();