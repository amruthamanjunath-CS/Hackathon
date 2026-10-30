// Dashboard rendering: alerts, engagement chart, comparison with the person's own baseline.
(function () {
  const $ = s => document.querySelector(s);
  
  ML.renderDashboard = function () {
    const a = ML.analyze();
    
    // Render Alerts
    $('#alerts').innerHTML = a.alerts.length 
      ? a.alerts.map(t => `<div class="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl mb-2 text-sm font-semibold flex items-center gap-2">⚠️ ${t}</div>`).join('') 
      : '<div class="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-sm font-semibold flex items-center gap-2">✅ Everything looks like their usual pattern.</div>';
    
    // Render Chart Bars
    const max = Math.max(8, ...a.series.map(s => s.score)), H = 150;
    
    $('#chart').innerHTML = a.series.map((s, i) => {
      const isLow = a.base.score && s.score < 0.7 * a.base.score && i < 7;
      const isLive = i === 7;
      const heightPx = (s.score / max) * H;
      
      return `
        <div class="col flex-1 flex flex-col items-center justify-end h-full relative group">
          <div class="bar w-full rounded-t-lg transition-all duration-300 flex items-end justify-center pb-2 text-xs font-bold text-white shadow-sm ${isLow ? 'bg-amber-500' : 'bg-teal-600'} ${isLive ? 'opacity-60 ring-2 ring-teal-400' : ''}" style="height:${heightPx}px">
            <span class="drop-shadow">${s.score}</span>
          </div>
        </div>
      `;
    }).join('') + `<div class="baseline absolute w-full border-b-2 border-dashed border-rose-400 pointer-events-none" style="bottom:${(a.base.score / max) * H}px"><em class="absolute right-0 -top-5 text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded shadow-sm">usual ${a.base.score.toFixed(1)}</em></div>`;
    
    // Render Labels
    $('#labels').innerHTML = a.series.map((s, i) => `<div class="flex-1 text-center">${i === 7 ? 'Today' : a.wd(s.date)}</div>`).join('');
    
    // Render Changes
    $('#changes').innerHTML = a.changes.length ? '<ul class="list-disc pl-5 space-y-1">' + a.changes.map(c => `<li>${c}</li>`).join('') + '</ul>' : '<p>Nothing has changed from their usual pattern.</p>';
    
    // Render Comparison Table
    const f = x => x.toFixed(1);
    const row = (n, k) => `<tr class="border-b border-stone-100 hover:bg-stone-50"><td class="py-2.5 px-3 font-medium text-stone-700">${n}</td><td class="py-2.5 px-3 text-stone-600">${f(a.base[k])}</td><td class="py-2.5 px-3 font-bold text-stone-900">${f(a.rec[k])}</td></tr>`;
    
    $('#cmp').innerHTML = `
      <thead>
        <tr class="border-b border-stone-200 text-xs font-bold text-stone-400 uppercase">
          <th class="py-2 px-3">Metric</th>
          <th class="py-2 px-3">Usual</th>
          <th class="py-2 px-3">Last 2 days</th>
        </tr>
      </thead>
      <tbody>
        ${row('Reminders confirmed', 'rem')}
        ${row('Reminders missed', 'missed')}
        ${row('Games', 'game')}
        ${row('Photos', 'album')}
        ${row('Total score', 'score')}
      </tbody>
    `;
  };
})();