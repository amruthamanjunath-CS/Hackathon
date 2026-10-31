// Shared data layer: localStorage state, simulated week, engagement analysis, and emergency event handling.
window.ML = window.ML || {};
(function () {
  const KEY = 'memorylane.v1', DAY = 864e5;
  const dkey = t => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const art = (e, c) => 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="${c}"/><text x="300" y="250" font-size="170" text-anchor="middle">${e}</text></svg>`);
  
  const REMS = [
    { id: 'r1', time: '08:00', label: 'Take your morning tablets', short: 'Morning tablets', icon: '💊' },
    { id: 'r2', time: '13:00', label: 'Have your lunch', short: 'Lunch', icon: '🍲' },
    { id: 'r3', time: '19:00', label: 'Take your evening tablet', short: 'Evening tablet', icon: '💊' }
  ];
  
  const ALBUM = [
    { id: 'a1', photo: art('👰', '#fde7d9'), caption: 'This is your granddaughter Meera on her wedding day.', question: 'Who is this smiling bride?', audio: null },
    { id: 'a2', photo: art('🏫', '#dbeafe'), caption: 'This is the school where you taught for many years.', question: 'Do you remember this place?', audio: null }
  ];
  
  ML.dkey = dkey;

  function seed() {
    const ev = [], now = Date.now();
    for (let i = 7; i >= 1; i--) {
      const at = h => { const d = new Date(now - i * DAY); d.setHours(h, 0, 0, 0); return d.getTime(); };
      REMS.forEach((r, j) => ev.push({ ts: at(8 + j * 5), type: 'reminder', ref: r.id, status: (i === 2 && j === 0) || (i === 1 && j < 2) ? 'missed' : 'done' }));
      const g = i === 1 ? 1 : 2, a = i >= 3 ? 2 : 1;
      for (let k = 0; k < g; k++) ev.push({ ts: at(10 + k * 4), type: 'game', name: k ? 'Which one?' : 'Match pairs', status: 'done' });
      for (let k = 0; k < a; k++) ev.push({ ts: at(11 + k * 5), type: 'album', ref: ALBUM[k % 2].id, status: 'done' });
    }
    return ev;
  }

  function fresh() { return { reminders: REMS.slice(), album: ALBUM.slice(), events: seed() }; }
  
  function load() { 
    try { 
      const s = JSON.parse(localStorage.getItem(KEY)); 
      if (s && s.events) return s; 
    } catch (e) {} 
    return fresh(); 
  }

  ML.state = load();
  
  ML.save = () => { 
    try { 
      localStorage.setItem(KEY, JSON.stringify(ML.state)); 
      return true; 
    } catch (e) { 
      alert('Storage is full. Try a smaller photo or audio file.'); 
      return false; 
    } 
  };

  ML.log = ev => { 
    ML.state.events.push(Object.assign({ ts: Date.now() }, ev)); 
    ML.save(); 
  };

  ML.reset = () => { 
    ML.state = fresh(); 
    ML.save(); 
  };

  ML.clearEvents = () => { 
    ML.state.events = []; 
    ML.save(); 
  };

  // Listen for real-time state sync across browser tabs (e.g. Patient SOS -> Caregiver Dashboard)
  window.addEventListener('storage', (e) => {
    if (e.key === KEY && e.newValue) {
      try {
        ML.state = JSON.parse(e.newValue);
        if (typeof ML.renderDashboard === 'function') {
          ML.renderDashboard();
        }
      } catch (err) {}
    }
  });

  ML.analyze = function () {
    const st = ML.state, days = [];
    for (let i = 7; i >= 0; i--) days.push(dkey(Date.now() - i * DAY));
    
    const series = days.map(d => {
      const e = st.events.filter(x => dkey(x.ts) === d), c = (t, s) => e.filter(x => x.type === t && (!s || x.status === s)).length;
      const rem = c('reminder', 'done'), game = c('game'), album = c('album');
      return { 
        date: d, rem, game, album, missed: c('reminder', 'missed'), score: rem + game + album,
        missedRefs: e.filter(x => x.type === 'reminder' && x.status === 'missed').map(x => x.ref) 
      };
    });

    const past = series.slice(0, 7), base = past.slice(0, 5), rec = past.slice(5);
    const avg = (a, k) => a.reduce((s, x) => s + x[k], 0) / a.length;
    const b = {}, r = {};
    
    ['score', 'rem', 'game', 'album', 'missed'].forEach(k => { b[k] = avg(base, k); r[k] = avg(rec, k); });
    
    const label = id => (st.reminders.find(x => x.id === id) || {}).short || 'Reminder';
    const wd = d => new Date(d + 'T12:00').toLocaleDateString('en', { weekday: 'short' });
    const today = series[7], alerts = [], changes = [];

    // Check for emergency SOS events and push to alerts if any exist
    const emergencyEvents = st.events.filter(x => x.type === 'emergency');
    if (emergencyEvents.length > 0) {
      alerts.unshift(`🚨 URGENT: Patient triggered ${emergencyEvents.length} emergency SOS help request(s).`);
    }

    if (b.score > 0 && r.score < 0.7 * b.score) {
      const dropPct = Math.round((1 - r.score / b.score) * 100);
      alerts.push(`Engagement is ${dropPct}% below their usual (${r.score.toFixed(1)} activities a day vs ${b.score.toFixed(1)}).`);
    }

    const missedBits = rec.filter(x => x.missed).map(x => `${x.missedRefs.map(label).join(', ')} (${wd(x.date)})`);
    if (missedBits.length) alerts.push('Missed reminders recently: ' + missedBits.join('; ') + '.');
    if (today.missed) alerts.push('Missed today: ' + today.missedRefs.map(label).join(', ') + '.');

    [['rem', 'Reminders confirmed'], ['game', 'Games played'], ['album', 'Photos looked at']].forEach(([k, n]) => {
      if (b[k] > 0 && r[k] < 0.8 * b[k]) changes.push(`${n}: usually ${b[k].toFixed(1)} a day, last 2 days ${r[k].toFixed(1)}.`);
    });

    if (b.missed < 0.5 && r.missed >= 1) {
      changes.push(`Missed reminders: almost never before, now ${r.missed.toFixed(1)} a day.`);
    }

    return { series, base: b, rec: r, alerts, changes, wd };
  };
})();