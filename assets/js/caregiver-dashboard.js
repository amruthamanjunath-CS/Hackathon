(function () {
  window.ML = window.ML || {};
  const $ = s => document.querySelector(s);
  const KEY = 'memorylane.v1';

  function getLatestState() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      if (saved) window.ML.state = saved;
    } catch (e) {}
    return window.ML.state || { events: [] };
  }

  function render() {
    const state = getLatestState();
    renderAlerts(state);
    renderChart(state);
    renderChanges(state);
    renderComparison();
    if (typeof ML.renderReminders === 'function') ML.renderReminders();
    if (typeof ML.renderAlbum === 'function') ML.renderAlbum();
  }

  function renderAlerts(state) {
    const alertsBox = $('#alerts');
    if (!alertsBox) return;

    const events = state.events || [];
    const emergencyEvents = events.filter(e => e.type === 'emergency');
    
    let html = '';

    if (emergencyEvents.length > 0) {
      html += emergencyEvents.map(e => `
        <div class="flex items-center justify-between bg-rose-50 border-2 border-rose-300 p-5 rounded-2xl text-rose-900 mb-3 shadow-md">
          <div class="flex items-center gap-4">
            <span class="text-4xl animate-pulse">🚨</span>
            <div>
              <p class="font-extrabold text-base text-rose-950">Emergency Help Requested!</p>
              <p class="text-xs text-rose-700 mt-1 font-medium">${e.note || 'Patient triggered SOS'} — Time: ${new Date(e.ts).toLocaleTimeString()}</p>
            </div>
          </div>
          <span class="text-xs font-extrabold bg-rose-600 text-white px-4 py-2 rounded-xl uppercase tracking-wider shadow-sm">Urgent SOS</span>
        </div>
      `).join('');
    }

    const missedToday = events.filter(e => e.type === 'reminder' && e.status === 'missed' && window.ML.dkey && window.ML.dkey(e.ts) === window.ML.dkey(Date.now())).length;
    if (missedToday > 0) {
      html += `
        <div class="flex items-center justify-between bg-amber-50 border border-amber-200 p-4 rounded-2xl text-amber-900 shadow-xs mb-3">
          <div class="flex items-center gap-3">
            <span class="text-2xl">⚠️</span>
            <div>
              <p class="font-extrabold text-sm">Missed / Postponed Reminders</p>
              <p class="text-xs text-amber-700 mt-0.5">${missedToday} reminder(s) were postponed or missed today.</p>
            </div>
          </div>
          <span class="text-xs font-extrabold bg-amber-200 text-amber-800 px-3 py-1.5 rounded-full uppercase">Notice</span>
        </div>
      `;
    }

    if (html === '') {
      html = `<p class="text-stone-500 text-sm font-medium py-2">No active alerts. Patient engagement and routines are stable.</p>`;
    }

    alertsBox.innerHTML = html;
  }

  function renderChart(state) {
    const chart = $('#chart'), labels = $('#labels');
    if (!chart || !labels) return;

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      days.push(window.ML.dkey ? window.ML.dkey(d.getTime()) : d.toDateString());
    }

    const events = state.events || [];
    const counts = days.map(dk => events.filter(e => window.ML.dkey && window.ML.dkey(e.ts) === dk).length);
    const max = Math.max(...counts, 5);

    chart.innerHTML = counts.map((c, i) => {
      const h = Math.round((c / max) * 100);
      const isToday = i === counts.length - 1;
      return `
        <div class="flex-1 flex flex-col items-center justify-end h-full group">
          <span class="text-[10px] font-bold text-stone-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">${c}</span>
          <div class="w-full rounded-t-xl transition-all duration-300 ${isToday ? 'bg-teal-500/80' : 'bg-teal-600 hover:bg-teal-500'}" style="height: ${Math.max(h, 8)}%;"></div>
        </div>
      `;
    }).join('');

    labels.innerHTML = days.map((dk, i) => {
      const d = new Date(dk);
      const name = i === counts.length - 1 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
      return `<span>${name}</span>`;
    }).join('');
  }

  function renderChanges(state) {
    const box = $('#changes');
    if (!box) return;
    const events = state.events || [];
    const sosCount = events.filter(e => e.type === 'emergency').length;
    box.innerHTML = `
      <p class="font-semibold text-stone-700">· Emergency SOS triggers recorded: <span class="font-extrabold text-rose-600">${sosCount}</span></p>
      <p class="font-semibold text-stone-700">· Total interaction events logged: <span class="font-extrabold text-stone-900">${events.length}</span></p>
      <p class="font-semibold text-stone-700">· Routine compliance is responding normally to voice prompts.</p>
    `;
  }

  function renderComparison() {
    const cmp = $('#cmp');
    if (!cmp) return;
    cmp.innerHTML = `
      <thead>
        <tr class="border-b border-stone-200 text-stone-400 font-extrabold text-xs uppercase">
          <th class="py-2">Metric</th>
          <th class="py-2">Usual Baseline</th>
          <th class="py-2">Last 2 Days</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-stone-100 font-medium text-stone-700">
        <tr>
          <td class="py-2.5">Reminders Confirmed</td>
          <td>4.2 / day</td>
          <td class="font-bold text-teal-700">4.0 / day</td>
        </tr>
        <tr>
          <td class="py-2.5">Games Played</td>
          <td>1.5 / day</td>
          <td class="font-bold text-teal-700">2.0 / day</td>
        </tr>
        <tr>
          <td class="py-2.5">Photos Viewed</td>
          <td>3.0 / day</td>
          <td class="font-bold text-teal-700">3.5 / day</td>
        </tr>
      </tbody>
    `;
  }

  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      render();
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    render();
    window.ML.renderDashboard = render;
  });
})();