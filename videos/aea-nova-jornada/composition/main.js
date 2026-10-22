/* AEA · Nova jornada de trabalho — linha do tempo do motion.
 * Tudo é dirigido por window.TIMING (gerado por scripts/tts.py): cada cena começa
 * na fala correspondente e os destaques caem na palavra falada (função W).
 * A timeline fica pausada; o renderizador chama window.__seek(t) quadro a quadro. */
(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  /* ---------------- ícones (traço, viewBox 64) ---------------- */
  const ICONS = {
    megaphone: '<path d="M8 26v12h8l22 12V14L16 26z"/><path d="M46 24c3 3 3 13 0 16M52 18c7 6 7 22 0 28"/><path d="M16 38l4 14h7l-3-12"/>',
    calendar: '<rect x="8" y="12" width="48" height="44" rx="7"/><path d="M8 25h48M21 6v12M43 6v12"/><circle class="f" cx="21" cy="35" r="3"/><circle class="f" cx="32" cy="35" r="3"/><circle class="f" cx="43" cy="35" r="3"/><circle class="f" cx="21" cy="46" r="3"/><circle class="f" cx="32" cy="46" r="3"/>',
    calclock: '<path d="M30 56H14a6 6 0 0 1-6-6V18a6 6 0 0 1 6-6h36a6 6 0 0 1 6 6v10"/><path d="M8 25h48M21 6v12M43 6v12"/><circle cx="46" cy="46" r="13"/><path d="M46 39v7l5 3"/>',
    clipboard: '<rect x="13" y="10" width="38" height="48" rx="6"/><path d="M24 10V5h16v5"/><path d="M21 28l4 4 8-8M21 44l4 4 8-8M38 29h6M38 45h6"/>',
    doc: '<path d="M16 6h22l12 12v40H16z"/><path d="M38 6v12h12M24 30h18M24 38h18M24 46h12"/>',
    docpen: '<path d="M44 32V18L32 6H12v52h18"/><path d="M32 6v12h12M19 26h16M19 34h12M19 42h8"/><path d="M38 58l18-18 5 5-18 18h-5z"/>',
    coins: '<ellipse cx="22" cy="14" rx="14" ry="6"/><path d="M8 14v10c0 3 6 6 14 6s14-3 14-6V14M8 24v10c0 3 6 6 14 6M8 34v10c0 3 6 6 14 6"/><rect x="34" y="30" width="24" height="28" rx="4"/><path d="M40 37h12M40 45h2M46 45h2M52 45h0M40 51h2M46 51h2"/>',
    people: '<circle cx="32" cy="19" r="8"/><path d="M17 54c0-10 7-16 15-16s15 6 15 16z"/><circle cx="13" cy="25" r="6"/><circle cx="51" cy="25" r="6"/><path d="M3 49c0-7 4-12 10-12M61 49c0-7-4-12-10-12"/>',
    chart: '<path d="M8 56h48"/><rect x="13" y="38" width="9" height="13" rx="1"/><rect x="28" y="30" width="9" height="21" rx="1"/><rect x="43" y="22" width="9" height="29" rx="1"/><path d="M10 30L26 18l9 6L54 9M45 8h10v10"/>',
    bed: '<path d="M6 48V16M6 38h52v10M58 48V33a8 8 0 0 0-8-8H28v13"/><circle cx="17" cy="29" r="5"/>',
    clock: '<circle cx="32" cy="32" r="25"/><path d="M32 17v15l10 6"/>',
    alert: '<circle cx="32" cy="32" r="26"/><path d="M32 17v19"/><circle class="f" cx="32" cy="46" r="3.4"/>',
    check: '<path d="M14 33l11 11 25-25"/>',
    x: '<path d="M19 19l26 26M45 19L19 45"/>',
    refresh: '<path d="M51 26A20 20 0 0 0 15 21M13 38a20 20 0 0 0 36 5"/><path d="M14 9v12h12M50 55V43H38"/>',
    plane: '<path d="M58 6L6 28l20 8 8 20z"/><path d="M58 6L26 36"/>',
    whatsapp: '<path d="M32 6a26 26 0 0 0-22.4 39.2L6 58l13.2-3.4A26 26 0 1 0 32 6z"/><path d="M23 21c-1.6 1.8-2.6 4.6.2 10.2 2.8 5.6 7.6 10.3 13.3 12.6 4.8 1.9 7 .3 8-1.7l.9-3.5-6.2-3.1-2.8 3c-3-1.2-6.6-4.6-8-7.6l2.8-2.8-2.8-6.2z"/>',
    briefcase: '<rect x="8" y="20" width="48" height="34" rx="6"/><path d="M24 20v-6h16v6M8 34h48"/>',
    punch: '<rect x="12" y="7" width="40" height="50" rx="7"/><circle cx="32" cy="27" r="10"/><path d="M32 21v6l4 3M22 46h20"/>',
    clockplus: '<circle cx="28" cy="35" r="21"/><path d="M28 24v11l8 5"/><path d="M53 5v14M46 12h14"/>',
    database: '<ellipse cx="32" cy="14" rx="20" ry="7"/><path d="M12 14v36c0 4 9 7 20 7s20-3 20-7V14M12 26c0 4 9 7 20 7s20-3 20-7M12 38c0 4 9 7 20 7s20-3 20-7"/>',
    lock: '<rect x="14" y="28" width="36" height="28" rx="6"/><path d="M22 28v-8a10 10 0 0 1 20 0v8"/><circle class="f" cx="32" cy="42" r="3.5"/>',
    arrowDown: '<path d="M32 10v42M16 37l16 16 16-16"/>',
    star: '<path class="f" d="M32 6l7.6 16.4 17.9 2.1-13.2 12.3 3.5 17.7L32 45.6l-15.8 8.9 3.5-17.7L6.5 24.5l17.9-2.1z"/>',
  };
  const ico = (name) => `<svg class="ico" viewBox="0 0 64 64">${ICONS[name]}</svg>`;

  /* ---------------- conteúdo gerado ---------------- */
  const DIAS = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
  $('#week').innerHTML = DIAS.map((d, i) => `
    <div class="day${i === 6 ? ' dom' : ''}"><div class="on"></div><div class="dn">${d}</div>
      ${i === 6 ? `<div class="bedi">${ico('bed')}</div>` : ''}<div class="ph"></div></div>`).join('');

  // exemplo ilustrativo de compensação: 1 + 3 + 2 + 2 = 8 descansos em 4 semanas
  const MES = [[6], [2, 5, 6], [3, 6], [0, 6]];
  $('#month').innerHTML = MES.map((folgas, w) => `
    <div class="wk" id="wk${w}">${w === 0 ? '<div class="ring"></div>' : ''}
      <div class="wl">SEM ${w + 1}</div>
      <div class="dots">${DIAS.map((_, d) => folgas.includes(d) ? `<div class="dot r">${ico('bed')}</div>` : '<div class="dot"></div>').join('')}</div>
      <div class="cnt">${folgas.length}<small>${folgas.length > 1 ? 'descansos' : 'descanso'}</small></div>
    </div>`).join('') + '<div class="note">Exemplo ilustrativo de compensação em um mês</div>';

  const CHECK8 = [['clock', 'Horários'], ['calendar', 'Escalas'], ['punch', 'Ponto'], ['clockplus', 'Horas extras'], ['database', 'Banco de horas'], ['doc', 'Normas coletivas']];
  $('#grid8').innerHTML = CHECK8.map(([i, t]) => `<div class="ck8"><div class="icirc">${ico(i)}</div><span>${t}</span><div class="tick">${ico('check')}</div></div>`).join('');
  $('#s8b-six').innerHTML = [1, 2, 3, 4, 5, 6].map((n) => `<span>${n}</span>`).join('');

  const ACOES = [
    { t: 'Mapeie a rotina', i: 'clipboard', d: 'Liste a jornada de cada colaborador, as folgas e os horários de maior movimento.' },
    { t: 'Simule novas escalas', i: 'calclock', d: 'Planeje a cobertura do atendimento e da produção. Avalie revezamentos e a necessidade de reforçar a equipe.' },
    { t: 'Valide com o DP', i: 'doc', d: 'Envie as escalas à AEA antes de aplicar. Confira as regras da categoria e a negociação coletiva necessária.' },
    { t: 'Revise os custos', i: 'coins', d: 'Simule o impacto na folha, nas horas extras e nas contratações, preservando os salários.' },
    { t: 'Atualize e comunique', i: 'people', d: 'Ajuste o ponto e os documentos após a validação. Informe à equipe os horários, as folgas e a data da mudança.' },
    { t: 'Acompanhe a adaptação', i: 'chart', d: 'Monitore atrasos, horas extras e produtividade. Reduza retrabalho e ajuste a operação com o apoio da AEA.' },
  ];
  const nn = (k) => String(k + 1).padStart(2, '0');
  $('#alist').innerHTML = ACOES.map((a, k) => `
    <div class="arow" id="ar${k}"><div class="hlb"></div>
      <div class="n"><i></i><b>${nn(k)}</b><b class="w">${nn(k)}</b></div>
      <div class="tt">${a.t}</div><div class="ok">${ico('check')}</div></div>`).join('');
  $('#acards').innerHTML = ACOES.map((a, k) => `
    <div class="card acard" id="ac${k}">
      <div class="num grad-text">${nn(k)}</div>
      <div class="icirc solid">${ico(a.i)}</div>
      <div class="abody"><div class="at">${a.t}</div><div class="ad">${a.d}</div></div>
      <div class="bar"></div>
    </div>`).join('');

  const COLS = ['SEG', 'TER', 'QUA', 'QUI', 'SEX'];
  const COL_H = 380, COL_BASE = 60, PCT_8H = (8 - 6) / (8.4 - 6); // eixo cortado: base = 6h, topo = 8h24
  $('#chart').innerHTML = COLS.map((d, k) => `
    <div class="col" style="left:${k * 152}px"><div class="cv">8h24</div>
      <div class="colb"><div class="base" style="height:${PCT_8H * 100}%"></div><div class="ext" style="height:${(1 - PCT_8H) * 100}%"></div></div>
      <svg class="brk" viewBox="0 0 148 26" preserveAspectRatio="none"><path d="M0 8 L18 2 L37 14 L56 2 L74 14 L93 2 L111 14 L130 2 L148 8 V20 L130 14 L111 26 L93 14 L74 26 L56 14 L37 26 L18 14 L0 20Z" fill="#F6FAFF"/></svg>
      <div class="cl">${d}</div></div>`).join('') +
    `<div id="line8" style="top:${470 - COL_BASE - PCT_8H * COL_H}px"><span>8h</span><div id="ext-lbl">+24 min<small>por dia</small></div></div>`;

  const NUM = ['(12)', ' ', '3', '9', '2', '1', '-', '6', '0', '0', '9'];
  $('#pnum').innerHTML = NUM.map((c) => `<span>${c}</span>`).join('');

  $$('[data-ico]').forEach((el) => { el.outerHTML = ico(el.dataset.ico); });

  /* ---------------- marca: anel em triângulo arredondado ---------------- */
  function roundedPoly(pts, r) {
    const n = pts.length;
    let d = '';
    for (let i = 0; i < n; i++) {
      const p = pts[i], a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n];
      const u = (q) => { const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy); return [dx / l, dy / l]; };
      const ua = u(a), ub = u(b);
      const p1 = [p[0] + ua[0] * r, p[1] + ua[1] * r], p2 = [p[0] + ub[0] * r, p[1] + ub[1] * r];
      d += `${i ? 'L' : 'M'}${p1[0].toFixed(2)} ${p1[1].toFixed(2)} Q${p[0]} ${p[1]} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)} `;
    }
    return d + 'Z';
  }
  const ringD = roundedPoly([[14, 22], [196, 66], [86, 198]], 74) + ' ' + roundedPoly([[66, 70], [154, 88], [98, 152]], 34);
  $$('.ring-d').forEach((p) => p.setAttribute('d', ringD));

  // marcações do relógio da abertura
  $('#ticks').innerHTML = Array.from({ length: 60 }, (_, i) => {
    const a = (i / 60) * Math.PI * 2, big = i % 5 === 0, r1 = big ? 222 : 248, r2 = 272;
    return `<line x1="${(Math.sin(a) * r1).toFixed(1)}" y1="${(-Math.cos(a) * r1).toFixed(1)}" x2="${(Math.sin(a) * r2).toFixed(1)}" y2="${(-Math.cos(a) * r2).toFixed(1)}"
      stroke="${big ? '#7FD3FF' : 'rgba(255,255,255,.45)'}" stroke-width="${big ? 10 : 4}" stroke-linecap="round"/>`;
  }).join('');

  /* ---------------- tempos ---------------- */
  const S = {};
  TIMING.segmentos.forEach((s) => { S[s.id] = s; });
  const DUR = TIMING.duracao;
  const t = (id) => S[id].inicio;
  const e = (id) => S[id].inicio + S[id].duracao;
  // momento aproximado em que a palavra é falada (pausas de pontuação pesam mais)
  function W(id, palavra) {
    const s = S[id], txt = s.fala, i = txt.toLowerCase().indexOf(palavra.toLowerCase());
    if (i < 0) throw new Error(`palavra "${palavra}" não encontrada em ${id}`);
    const peso = (c) => (/[,.:;?!]/.test(c) ? 5 : c === ' ' ? 0.6 : 1);
    let antes = 0, total = 0;
    [...txt].forEach((c, k) => { total += peso(c); if (k < i) antes += peso(c); });
    return s.inicio + s.duracao * (antes / total);
  }

  /* ---------------- ajuste de títulos à largura útil ---------------- */
  function fitAll() {
    $$('.fit').forEach((el) => {
      const max = 940;
      const spans = el.querySelectorAll('.mask > span');
      let w = 0;
      if (spans.length) spans.forEach((s) => { w = Math.max(w, s.getBoundingClientRect().width); });
      else { const r = document.createRange(); r.selectNodeContents(el); w = r.getBoundingClientRect().width; }
      if (w > max) el.style.fontSize = `${parseFloat(getComputedStyle(el).fontSize) * (max / w)}px`;
    });
  }

  /* ---------------- timeline ---------------- */
  function build() {
    const tl = gsap.timeline({ paused: true });
    const SFX = [];
    const cue = (type, at, gain = 1) => SFX.push({ type, t: +Math.max(0, at).toFixed(3), gain });
    const ft = (el, from, to, at) => { gsap.set(el, from); tl.to(el, to, at); };
    const rise = (el, at, o = {}) => ft(el, { opacity: 0, y: o.y ?? 50, x: o.x ?? 0 },
      { opacity: o.to ?? 1, y: 0, x: 0, duration: o.d ?? 0.7, ease: o.ease ?? 'power3.out', stagger: o.st ?? 0 }, at);
    const pop = (el, at, o = {}) => ft(el, { opacity: 0, scale: o.s ?? 0.5, transformOrigin: o.origin ?? '50% 50%' },
      { opacity: 1, scale: 1, duration: o.d ?? 0.6, ease: o.ease ?? 'back.out(1.8)', stagger: o.st ?? 0 }, at);
    const mask = (sel, at, o = {}) => ft(`${sel} .mask > span`, { yPercent: 135 },
      { yPercent: 0, duration: o.d ?? 0.85, ease: 'expo.out', stagger: o.st ?? 0.1 }, at);
    const out = (els, at, o = {}) => tl.to(els, { opacity: 0, y: o.y ?? -40, duration: o.d ?? 0.42, ease: 'power2.in', stagger: o.st ?? 0.04 }, at);
    const scene = (id, a, b) => { tl.set(`#${id}`, { visibility: 'visible' }, a); tl.set(`#${id}`, { visibility: 'hidden' }, b); };
    const draw = (el, at, d = 1) => {
      const len = el.getTotalLength();
      ft(el, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: d, ease: 'power2.inOut' }, at);
    };
    const iris = (from, to, at, d = 0.8) => tl.fromTo('#bgDark', { clipPath: from }, { clipPath: to, duration: d, ease: 'power3.inOut', immediateRender: false }, at);
    const hdrColor = (dark, at) => {
      tl.to('#hdr', { color: dark ? '#FFFFFF' : '#0A1F44', duration: 0.4 }, at);
      tl.to('#ftr', { color: dark ? '#9BD3FF' : '#6B7F9E', duration: 0.4 }, at);
    };

    // ambiente: fundo sempre em movimento lento
    tl.to('.b1', { x: 140, y: 90, duration: DUR, ease: 'none' }, 0);
    tl.to('.b2', { x: -160, y: -140, duration: DUR, ease: 'none' }, 0);
    tl.to('.b3', { x: 120, y: -80, duration: DUR, ease: 'none' }, 0);
    tl.to('#wv1, #wv2', { x: -18, y: -10, duration: DUR, ease: 'sine.inOut' }, 0);
    tl.to('#wv3, #wv4', { x: 26, y: 18, duration: DUR, ease: 'sine.inOut' }, 0);
    tl.to('#bgDark .glow', { x: 80, y: 240, scale: 1.15, duration: DUR, ease: 'none' }, 0);

    /* 1 · abertura --------------------------------------------------- */
    gsap.set('#bgDark', { clipPath: 'circle(1500px at 540px 640px)' });
    const x1 = t('s03') - 0.65;
    scene('sc1', 0, t('s03') + 0.3);
    const ringLen = 2 * Math.PI * 300;
    ft('#clk-ring', { strokeDasharray: ringLen, strokeDashoffset: ringLen, rotation: -90, svgOrigin: '0 0' },
      { strokeDashoffset: 0, duration: 1.3, ease: 'power2.inOut' }, 0.05);
    ft('#ticks line', { opacity: 0, scale: 0.6, svgOrigin: '0 0' }, { opacity: 1, scale: 1, duration: 0.3, stagger: 0.012, ease: 'power2.out' }, 0.25);
    pop('#clk-hands', 0.5, { s: 0.2 });
    ft('#hMin', { rotation: 0, svgOrigin: '0 0' }, { rotation: 720, duration: 4.6, ease: 'power2.inOut' }, 0.5);
    ft('#hHour', { rotation: 0, svgOrigin: '0 0' }, { rotation: 60, duration: 4.6, ease: 'power2.inOut' }, 0.5);
    ft('#clk-glow', { scale: 0.8, opacity: 0, svgOrigin: '0 0' }, { scale: 1.08, opacity: 1, duration: 2.5, ease: 'sine.inOut' }, 0.4);
    pop('#s1-pill .pill', 0.3, { s: 0.6 });
    cue('pop', 0.3, 0.5);
    mask('#s1-l1', t('s01') - 0.05);
    const vai = W('s01', 'vai');
    ft('#s1-l2 .mask > span', { yPercent: 150, scale: 1.25, transformOrigin: '50% 100%' }, { yPercent: 0, scale: 1, duration: 0.9, ease: 'expo.out' }, vai - 0.1);
    cue('impact', vai - 0.02, 0.55);
    rise('#s1-l3', t('s02'), { y: 30 });
    out(['#s1-pill', '#s1-l1', '#s1-l2', '#s1-l3'], x1, { y: -60 });
    tl.to('#clock', { scale: 0.5, opacity: 0, duration: 0.75, ease: 'power3.in', transformOrigin: '50% 50%' }, x1 + 0.1);
    tl.to('#bgDark', { clipPath: 'circle(0px at 540px 640px)', duration: 0.85, ease: 'power3.inOut' }, x1 + 0.15);
    cue('riser', x1 - 1.1, 0.6);
    cue('whoosh', x1 + 0.15, 0.8);

    /* 2 · marca e título --------------------------------------------- */
    scene('sc2', t('s03') - 0.6, t('s05') + 0.2);
    ft('#lockup .mk', { scale: 0.25, rotation: -150, opacity: 0, transformOrigin: '50% 50%' },
      { scale: 1, rotation: 0, opacity: 1, duration: 1.4, ease: 'expo.out' }, t('s03') - 0.45);
    draw($('#mk-line'), t('s03') - 0.45, 1.0);
    ft('#mk-fill', { opacity: 0 }, { opacity: 1, duration: 0.6 }, t('s03') - 0.05);
    tl.to('#mk-line', { opacity: 0, duration: 0.5 }, t('s03') + 0.6);
    rise('#lockup .wm-aea span', t('s03') + 0.05, { y: 90, st: 0.08, ease: 'expo.out', d: 0.9 });
    rise('#lockup .wm-cont', t('s03') + 0.35, { y: 40 });
    rise('#lockup .wm-cons', t('s03') + 0.5, { y: 20 });
    ft('#lockup .wm-cons i', { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power3.out' }, t('s03') + 0.7);
    cue('chime', t('s03') - 0.3, 0.9);
    const x2 = t('s04') - 0.55;
    tl.to('#lockup', { y: -470, scale: 0.26, opacity: 0, duration: 0.75, ease: 'power3.inOut', transformOrigin: '50% 0%' }, x2);
    rise('#hdr', x2 + 0.4, { y: -24 });
    rise('#ftr', x2 + 0.55, { y: 24 });
    ft('#ftr .bar i', { scaleX: 0 }, { scaleX: 1, duration: DUR - (x2 + 0.55), ease: 'none' }, x2 + 0.55);
    cue('whoosh', x2, 0.5);
    pop('#s2-pill', t('s04') - 0.25, { s: 0.6 });
    mask('#s2-t1', t('s04') - 0.05);
    mask('#s2-t2', t('s04') + 0.12);
    cue('impact', t('s04') + 0.05, 0.35);
    rise('#s2-sub', W('s04', 'redução') - 0.1, { y: 30 });
    ft('#s2-sub em i', { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power3.inOut' }, W('s04', 'mais') - 0.1);
    out(['#s2-pill-wrap', '#s2-t1', '#s2-t2', '#s2-sub'], t('s05') - 0.55);
    cue('whoosh', t('s05') - 0.5, 0.45);

    /* 3 · linha do tempo --------------------------------------------- */
    scene('sc3', t('s05') - 0.3, t('s08') + 0.1);
    rise('#s3-eb', t('s05') - 0.3, { y: 20 });
    rise('#s3-tt', t('s05') - 0.2, { y: 30 });
    rise('#odo .dg, #odo .hh', t('s05') - 0.05, { y: 140, st: 0.08, d: 0.9, ease: 'expo.out' });
    rise('#odo-lbl', t('s05') + 0.3, { y: 20 });
    pop('#chip-hoje', W('s05', 'limite') - 0.1);
    ft('#stepper .rail', { scaleX: 0 }, { scaleX: 1, duration: 1.0, ease: 'power2.inOut' }, t('s05') + 0.6);
    gsap.set('#stepper .fill', { scaleX: 0 });
    pop('#stepper .node', t('s05') + 0.8, { st: 0.18, s: 0.6 });
    const activate = (n, at) => {
      ft(`#nd${n} .dot i`, { scale: 0 }, { scale: 1, duration: 0.45, ease: 'back.out(2.2)' }, at);
      tl.to(`#nd${n} .dot`, { borderColor: '#BFE0FF', duration: 0.3 }, at);
      tl.to(`#nd${n} .vl, #nd${n} .dt`, { color: '#0A1F44', duration: 0.3 }, at);
      tl.fromTo(`#nd${n} .vl`, { scale: 1 }, { scale: 1.25, duration: 0.25, yoyo: true, repeat: 1, ease: 'power2.out', immediateRender: false }, at);
      cue('pop', at, 0.4);
    };
    activate(0, t('s05') + 1.35);
    // 2026
    tl.to('#chip-hoje', { opacity: 0, y: -16, duration: 0.3 }, t('s06') + 0.05);
    pop('#chip-26', t('s06') + 0.2, { s: 0.7 });
    tl.to('#stepper .fill', { scaleX: 0.5, duration: 1.4, ease: 'power2.inOut' }, t('s06') + 0.2);
    activate(1, t('s06') + 1.55);
    const q42 = W('s06', 'quarenta');
    tl.to('#odo .strip', { yPercent: -40, duration: 1.0, ease: 'power3.inOut' }, q42 - 0.35);
    cue('tick', q42 - 0.05, 0.6); cue('tick', q42 + 0.2, 0.6);
    rise('#c26', q42 + 0.15, { y: 90, d: 0.8, ease: 'expo.out' });
    cue('whoosh', q42 + 0.1, 0.3);
    pop('#c26-plus', W('s06', 'dois dias') - 0.15, { s: 0.6, origin: '0% 50%' });
    cue('pop', W('s06', 'dois dias') - 0.1, 0.6);
    // 2027
    tl.to('#chip-26', { opacity: 0, y: -16, duration: 0.3 }, t('s07') + 0.05);
    pop('#chip-27', t('s07') + 0.2, { s: 0.7 });
    tl.to('#stepper .fill', { scaleX: 1, duration: 1.4, ease: 'power2.inOut' }, t('s07') + 0.2);
    activate(2, t('s07') + 1.55);
    const q40 = W('s07', 'quarenta');
    tl.to('#odo .strip', { yPercent: -80, duration: 1.0, ease: 'power3.inOut' }, q40 - 0.35);
    cue('tick', q40 - 0.05, 0.6); cue('tick', q40 + 0.2, 0.6);
    tl.to('#c26', { opacity: 0, x: -140, duration: 0.45, ease: 'power2.in' }, q40 - 0.1);
    rise('#c27', q40 + 0.15, { y: 0, x: 160, d: 0.8, ease: 'expo.out' });
    cue('whoosh', q40, 0.3);
    out(['#s3-eb', '#s3-tt', '#odo', '#odo-lbl', '#chip-27', '#stepper', '#c27'], t('s08') - 0.6, { st: 0.03 });

    /* 4 · salário (fundo escuro) ------------------------------------- */
    scene('sc4', t('s08') - 0.45, t('s10') + 0.1);
    iris('circle(0px at 540px 960px)', 'circle(1300px at 540px 960px)', t('s08') - 0.6);
    hdrColor(true, t('s08') - 0.45);
    cue('whoosh', t('s08') - 0.6, 0.7);
    ft('#bars .bar', { scaleY: 0 }, { scaleY: 1, duration: 0.8, ease: 'power3.out', stagger: 0.12 }, t('s08') - 0.15);
    rise('#bars .lbl, #bars .val', t('s08') + 0.05, { y: 20, st: 0.05 });
    rise('#bars .topv', t('s08') + 0.2, { y: 20, st: 0.1 });
    gsap.set('#tv-j .b', { opacity: 0, y: 30 });
    const dim = W('s08', 'diminui');
    tl.to('#bc-j .bar', { scaleY: 40 / 44, duration: 0.8, ease: 'power2.inOut' }, dim - 0.25);
    tl.to('#tv-j', { y: 420 * (1 - 40 / 44), duration: 0.8, ease: 'power2.inOut' }, dim - 0.25);
    tl.to('#tv-j .a', { opacity: 0, y: -30, duration: 0.3 }, dim - 0.1);
    tl.to('#tv-j .b', { opacity: 1, y: 0, duration: 0.35 }, dim + 0.05);
    pop('#arrowJ', dim, { s: 0.3 });
    cue('tick', dim, 0.5);
    const sal = W('s08', 'salário');
    pop('#lockico', sal - 0.1, { s: 0.2, ease: 'back.out(3)' });
    tl.to('#bc-s .bar', { boxShadow: '0 0 70px 12px rgba(79,184,255,.55)', duration: 0.5 }, sal - 0.1);
    cue('pop', sal - 0.05, 0.7);
    gsap.set('#stamp', { scale: 2.1, opacity: 0, rotation: -7 });
    tl.to('#stamp', { scale: 1, opacity: 1, rotation: -2, duration: 0.4, ease: 'power4.in' }, t('s09') - 0.2);
    tl.to('#stamp', { rotation: 0, duration: 0.8, ease: 'elastic.out(1, .4)' }, t('s09') + 0.2);
    ft('#shock', { scale: 0.3, opacity: 0 }, { keyframes: [{ opacity: 0.9, duration: 0.04 }, { scale: 1.6, opacity: 0, duration: 0.9, ease: 'power2.out' }] }, t('s09') + 0.18);
    tl.to('#sc4', { keyframes: { x: [0, -12, 9, -6, 3, 0] }, duration: 0.4, ease: 'none' }, t('s09') + 0.2);
    cue('impact', t('s09') + 0.18, 1);
    rise('#chip4a', W('s09', 'inclusive') - 0.15, { y: 40 });
    cue('pop', W('s09', 'inclusive') - 0.1, 0.45);
    rise('#chip4b', W('s09', 'pisos') - 0.35, { y: 40 });
    cue('pop', W('s09', 'pisos') - 0.3, 0.45);
    out(['#bars', '#stamp-wrap', '#chips4'], t('s10') - 0.6);
    tl.to('#bgDark', { clipPath: 'circle(0px at 540px 960px)', duration: 0.75, ease: 'power3.inOut' }, t('s10') - 0.55);
    hdrColor(false, t('s10') - 0.4);
    cue('whoosh', t('s10') - 0.55, 0.6);

    /* 5 · folgas ----------------------------------------------------- */
    scene('sc5', t('s10') - 0.35, t('s12') + 0.1);
    pop('#s5-tt .icirc', t('s10') - 0.25, { s: 0.3 });
    mask('#s5-tt', t('s10') - 0.15);
    rise('#week .day', t('s10') + 0.35, { y: 70, st: 0.06, ease: 'back.out(1.6)' });
    const dois = W('s10', 'dois dias');
    tl.to('#week .dom .on', { opacity: 1, duration: 0.45 }, dois - 0.1);
    tl.to('#week .dom .dn', { color: '#FFFFFF', duration: 0.3 }, dois - 0.1);
    tl.to('#week .dom .ph', { opacity: 0, duration: 0.2 }, dois - 0.1);
    pop('#week .dom .bedi', dois, { s: 0.3 });
    tl.fromTo('#week .dom', { scale: 1 }, { scale: 1.08, duration: 0.25, yoyo: true, repeat: 1, immediateRender: false }, dois - 0.05);
    cue('pop', dois - 0.05, 0.6);
    draw($('#brk-path'), dois + 0.35, 0.8);
    rise('#brk p', dois + 0.6, { y: 20 });
    pop('#s5-two .pill', dois + 0.2, { s: 0.6 });
    pop('#dom-call', W('s10', 'preferencialmente') - 0.15, { s: 0.6, origin: '90% 100%' });
    cue('pop', W('s10', 'preferencialmente') - 0.1, 0.5);
    out(['#s5-tt', '#dom-call', '#week', '#brk', '#s5-two'], t('s11') - 0.5, { y: -60 });
    cue('whoosh', t('s11') - 0.45, 0.4);
    rise('#s5b-eb', t('s11') - 0.25, { y: 20 });
    rise('#s5b-tt', t('s11') - 0.15, { y: 30 });
    rise('#s5b-card', W('s11', 'dependem') - 0.2, { y: 50 });
    const media = W('s11', 'média');
    rise('#month .wk', media - 0.9, { y: 30, st: 0.1 });
    pop('#month .dot.r', media - 0.55, { s: 0, st: 0.05, ease: 'back.out(2.5)', d: 0.4 });
    rise('#month .note', media - 0.3, { y: 10 });
    pop('#st1', media - 0.05, { s: 0.7 });
    cue('pop', media, 0.5);
    const menos = W('s11', 'pelo menos');
    pop('#st2', menos - 0.1, { s: 0.7 });
    ft('#wk0 .ring', { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'power3.out' }, menos + 0.1);
    cue('pop', menos, 0.5);
    out(['#s5b-eb', '#s5b-tt', '#s5b-card', '#month', '#stats'], t('s12') - 0.55, { st: 0.03 });
    cue('whoosh', t('s12') - 0.5, 0.4);

    /* 6 · já trabalha 40h ou menos ---------------------------------- */
    scene('sc6', t('s12') - 0.35, t('s14') + 0.1);
    pop('#s6-ic .icirc', t('s12') - 0.3, { s: 0.3 });
    mask('#s6-l1', t('s12') - 0.15);
    const q40b = W('s12', 'quarenta');
    ft('#s6-l2 .mask > span', { yPercent: 150, scale: 1.2, transformOrigin: '50% 100%' }, { yPercent: 0, scale: 1, duration: 0.9, ease: 'expo.out' }, q40b - 0.15);
    cue('impact', q40b - 0.05, 0.45);
    mask('#s6-l3', W('s12', 'ou menos') - 0.15);
    rise('#ans1', t('s13') - 0.15, { y: 0, x: -90 });
    cue('pop', t('s13') - 0.1, 0.45);
    const mas = W('s13', 'mas');
    rise('#ans2', mas - 0.2, { y: 0, x: -90 });
    ft('#ans2 .sweep', { x: 0 }, { x: 1500, duration: 1.2, ease: 'power2.inOut' }, mas + 0.4);
    cue('pop', mas - 0.15, 0.5);
    out(['#s6-ic', '#s6-l1', '#s6-l2', '#s6-l3', '#ans1', '#ans2'], t('s14') - 0.6, { st: 0.03 });
    cue('whoosh', t('s14') - 0.5, 0.4);

    /* 7 · atenção à distribuição das horas -------------------------- */
    scene('sc7', t('s14') - 0.35, t('s15') + 0.1);
    pop('#s7-alert .icirc', t('s14') - 0.3, { s: 0.3, ease: 'back.out(3)' });
    gsap.set('#s7-alert .pulse', { opacity: 0 });
    tl.fromTo('#s7-alert .pulse', { scale: 1, opacity: 0.8 }, { scale: 2, opacity: 0, duration: 1.4, repeat: 5, stagger: 0.7, ease: 'power1.out', immediateRender: false }, t('s14'));
    cue('alert', t('s14') - 0.25, 0.6);
    mask('#s7-tt', t('s14') - 0.15);
    const q42b = W('s14', 'quarenta'), cinco = W('s14', 'cinco'), amp = W('s14', 'ampliando');
    pop('#eq1', q42b - 0.1);
    pop('#eqd', cinco - 0.45, { s: 0.2 });
    pop('#eq2', cinco - 0.25);
    cue('pop', q42b - 0.05, 0.4); cue('pop', cinco - 0.2, 0.4);
    pop('#eqe', cinco + 0.3, { s: 0.2 });
    pop('#eqr', cinco + 0.45, { s: 0.6 });
    cue('pop', cinco + 0.45, 0.55);
    ft('#chart .colb', { scaleY: 0 }, { scaleY: 1, duration: 0.8, ease: 'power3.out', stagger: 0.08 }, cinco + 0.5);
    rise('#chart .cl', cinco + 0.5, { y: 14, st: 0.08 });
    rise('#chart .brk', cinco + 0.5, { y: 0, st: 0.08 });
    pop('#chart .cv', cinco + 1.0, { s: 0.5, st: 0.06 });
    ft('#line8', { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 0.7, ease: 'power2.inOut' }, cinco + 1.1);
    rise('#ext-lbl', amp - 0.1, { y: 0, x: -30 });
    tl.fromTo('#chart .ext', { opacity: 1 }, { opacity: 0.35, duration: 0.22, yoyo: true, repeat: 3, ease: 'sine.inOut', immediateRender: false }, amp);
    cue('pop', amp - 0.05, 0.5);
    rise('#s7-res', W('s14', 'necessária') - 0.35, { y: 60 });
    cue('whoosh', W('s14', 'necessária') - 0.35, 0.3);
    out(['#s7-top', '#s7-tt', '#eq', '#chart', '#s7-res'], t('s15') - 0.6, { st: 0.03 });
    cue('whoosh', t('s15') - 0.5, 0.4);

    /* 8 · checklist do empresário ----------------------------------- */
    scene('sc8', t('s15') - 0.35, t('s17') + 0.1);
    mask('#s8-l1', t('s15') - 0.2);
    mask('#s8-l2', t('s15') + 0.35);
    const pal8 = ['horários', 'escalas', 'ponto', 'horas extras', 'banco', 'normas'];
    $$('#grid8 .ck8').forEach((el, k) => {
      const at = W('s15', pal8[k]) - 0.2;
      pop(el, at, { s: 0.7 });
      pop(el.querySelector('.tick'), at + 0.35, { s: 0.2, ease: 'back.out(3)' });
      cue('pop', at + 0.35, 0.35);
    });
    out(['#s8-l1', '#s8-l2'], t('s16') - 0.5);
    tl.to('#grid8 .ck8', { opacity: 0, scale: 0.85, duration: 0.35, stagger: 0.03, ease: 'power2.in' }, t('s16') - 0.5);
    cue('whoosh', t('s16') - 0.45, 0.4);
    mask('#s8b-l1', t('s16') - 0.15);
    mask('#s8b-l2', t('s16') + 0.0);
    rise('#s8b-sub', W('s16', 'siga') - 0.3, { y: 20 });
    pop('#s8b-six span', W('s16', 'seis') - 0.2, { s: 0.3, st: 0.07, ease: 'back.out(2.5)' });
    cue('pop', W('s16', 'seis') - 0.1, 0.5);
    out(['#s8b-l1', '#s8b-l2', '#s8b-sub', '#s8b-six'], t('s17') - 0.55, { st: 0.03 });

    /* 9 · seis ações ------------------------------------------------- */
    scene('sc9', t('s17') - 0.4, t('s23') + 0.1);
    rise('#s9-eb', t('s17') - 0.4, { y: 20 });
    rise('#alist .arow', t('s17') - 0.35, { y: 30, st: 0.05, to: 0.5 });
    gsap.set('#alist .n i', { scale: 0 });
    gsap.set('#alist .n b.w', { opacity: 0 });
    gsap.set('#alist .ok', { opacity: 0, scale: 0.3 });
    gsap.set('#acards .acard', { opacity: 0 });
    ACOES.forEach((_, k) => {
      const seg = `s${17 + k}`, at = t(seg) - 0.3;
      const row = `#ar${k}`, card = `#ac${k}`;
      tl.to(row, { opacity: 1, duration: 0.3 }, at);
      tl.to(`${row} .hlb`, { opacity: 1, duration: 0.35 }, at);
      tl.to(`${row} .n i`, { scale: 1, duration: 0.4, ease: 'back.out(2)' }, at);
      tl.to(`${row} .n b.w`, { opacity: 1, duration: 0.2 }, at + 0.1);
      if (k > 0) {
        const prev = `#ar${k - 1}`;
        tl.to(`${prev} .hlb`, { opacity: 0, duration: 0.3 }, at);
        tl.to(`${prev} .ok`, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(3)' }, at);
        tl.to(`#ac${k - 1}`, { opacity: 0, x: -150, duration: 0.42, ease: 'power2.in' }, at - 0.1);
      }
      ft(card, { opacity: 0, x: 170 }, { opacity: 1, x: 0, duration: 0.75, ease: 'expo.out' }, at + 0.05);
      pop(`${card} .icirc`, at + 0.3, { s: 0.3, ease: 'back.out(2.5)' });
      rise(`${card} .ad`, at + 0.35, { y: 24 });
      const next = k < 5 ? t(`s${18 + k}`) - 0.3 : t('s23') - 0.45;
      ft(`${card} .bar`, { scaleX: 0 }, { scaleX: 1, duration: next - at - 0.1, ease: 'none' }, at + 0.1);
      cue('whoosh', at, 0.3);
      cue('pop', at + 0.3, 0.35);
    });
    tl.to('#ar5 .hlb', { opacity: 0, duration: 0.3 }, e('s22') + 0.05);
    tl.to('#ar5 .ok', { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(3)' }, e('s22') + 0.05);
    tl.to('#alist .arow', { opacity: 1, duration: 0.3 }, e('s22') + 0.05);
    cue('pop', e('s22') + 0.05, 0.5);
    out(['#s9-eb', '#alist', '#ac5'], t('s23') - 0.8, { st: 0.04 });

    /* 10 · CTA (fundo escuro) ---------------------------------------- */
    scene('sc10', t('s23') - 0.55, t('s25') + 0.1);
    iris('circle(0px at 120px 760px)', 'circle(2200px at 120px 760px)', t('s23') - 0.5, 0.9);
    hdrColor(true, t('s23') - 0.5);
    cue('whoosh', t('s23') - 0.5, 0.8);
    ft('#s10-plane', { x: -640, y: 520, rotation: 28, opacity: 0 },
      { keyframes: [{ opacity: 1, x: -380, y: 300, rotation: 18, duration: 0.45, ease: 'none' }, { x: 0, y: 0, rotation: 0, duration: 0.8, ease: 'power2.out' }] }, t('s23') - 0.4);
    ft('#trail', { opacity: 0 }, { opacity: 1, duration: 0.8 }, t('s23') - 0.35);
    tl.to('#trail', { opacity: 0, duration: 0.8 }, t('s23') + 1.2);
    tl.to('#s10-plane', { y: -10, duration: 1.2, yoyo: true, repeat: 5, ease: 'sine.inOut' }, t('s23') + 0.9);
    mask('#s10-tt', t('s23') - 0.05);
    cue('impact', t('s23') + 0.05, 0.4);
    rise('#s10-sub', W('s23', 'envie') - 0.25, { y: 20 });
    ['escala', 'relação', 'horários'].forEach((p, k) => {
      const at = W('s23', p) - 0.3;
      const row = $$('#docs .drow')[k];
      rise(row, at, { y: 0, x: 120, ease: 'expo.out' });
      pop(row.querySelector('.ck'), at + 0.4, { s: 0.2, ease: 'back.out(3)' });
      cue('pop', at + 0.4, 0.4);
    });
    rise('#phone', t('s24') - 0.4, { y: 140, d: 0.9, ease: 'expo.out' });
    cue('whoosh', t('s24') - 0.4, 0.5);
    gsap.set('#phone .pulse', { opacity: 0 });
    tl.fromTo('#phone .pulse', { scale: 1, opacity: 0.8 }, { scale: 1.8, opacity: 0, duration: 1.3, repeat: 6, stagger: 0.65, ease: 'power1.out', immediateRender: false }, t('s24') + 0.2);
    const digitos = $$('#pnum span');
    const d0 = W('s24', 'doze') - 0.1, d1 = W('s24', 'três') - 0.1, d2 = W('s24', 'telefone') - 0.45;
    pop(digitos[0], d0, { s: 0.4 });
    gsap.set(digitos[1], { opacity: 1 });
    cue('tick', d0, 0.45);
    const seq = [2, 3, 4, 5, 7, 8, 9, 10];
    seq.forEach((idx, k) => {
      const at = d1 + ((d2 - d1) * k) / (seq.length - 1);
      ft(digitos[idx], { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.3, ease: 'back.out(2.5)' }, at);
      cue('tick', at, 0.45);
      if (idx === 7) ft(digitos[6], { opacity: 0 }, { opacity: 1, duration: 0.2 }, at - 0.1);
    });
    tl.fromTo('#pnum', { scale: 1 }, { scale: 1.06, duration: 0.3, yoyo: true, repeat: 1, ease: 'power2.out', immediateRender: false }, d2 + 0.45);
    cue('chime', d2 + 0.45, 0.35);
    out(['#s10-plane', '#s10-tt', '#s10-sub', '#docs', '#phone'], t('s25') - 0.65, { st: 0.04 });
    tl.to('#bgDark', { clipPath: 'circle(0px at 540px 455px)', duration: 0.85, ease: 'power3.inOut' }, t('s25') - 0.6);
    out(['#hdr', '#ftr'], t('s25') - 0.6, { y: 0 });
    cue('whoosh', t('s25') - 0.6, 0.6);

    /* 11 · assinatura ------------------------------------------------ */
    scene('sc11', t('s25') - 0.55, DUR + 1);
    ft('#lock2 .mk', { scale: 0.25, rotation: -150, opacity: 0, transformOrigin: '50% 50%' },
      { scale: 1, rotation: 0, opacity: 1, duration: 1.3, ease: 'expo.out' }, t('s25') - 0.4);
    rise('#lock2 .wm-aea span', t('s25') - 0.1, { y: 80, st: 0.08, ease: 'expo.out', d: 0.9 });
    rise('#lock2 .wm-cont', t('s25') + 0.15, { y: 30 });
    rise('#lock2 .wm-cons', t('s25') + 0.3, { y: 20 });
    ft('#lock2 .wm-cons i', { scaleX: 0 }, { scaleX: 1, duration: 0.6 }, t('s25') + 0.45);
    cue('chime', t('s25') - 0.35, 1);
    rise('#s11-tag', t('s25') + 0.25, { y: 40 });
    pop('#s11-pill .pill', W('s25', 'conte') - 0.1, { s: 0.6 });
    rise('#s11-pl2', W('s25', 'conte') + 0.1, { y: 20 });
    cue('pop', W('s25', 'conte') - 0.05, 0.5);
    rise('#s11-warn', e('s25') + 0.1, { y: 24 });
    rise('#s11-legal', e('s25') + 0.4, { y: 20 });

    tl.set({}, {}, DUR);
    return { tl, SFX };
  }

  /* ---------------- inicialização ---------------- */
  window.__ready = document.fonts.ready.then(() => {
    fitAll();
    const { tl, SFX } = build();
    window.__tl = tl;
    window.__sfx = SFX;
    window.__duration = TIMING.duracao;
    window.__seek = (time) => { tl.seek(time, false); };
    tl.seek(0, false);

    const params = new URLSearchParams(location.search);
    if (params.has('t')) tl.seek(parseFloat(params.get('t')), false);
    if (params.has('play')) {
      document.body.classList.add('preview');
      const st = $('#stage');
      const fit = () => { st.style.transform = `scale(${Math.min(innerWidth / 1080, innerHeight / 1920)})`; };
      fit(); addEventListener('resize', fit);
      tl.play(0);
    }
    return true;
  });
})();
