/* Animated pipeline explainer - mobile first.
   Diagrams are drawn in CONTAINER PIXEL SPACE (1 SVG unit = 1 CSS px) and laid out
   from the measured box, so a phone gets a vertically stacked, legible diagram
   instead of a shrunken landscape one. */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  function $(s, r) { return (r || document).querySelector(s); }

  /* ---------------- maths ---------------- */
  function clamp(v, a, b) { if (a === undefined) a = 0; if (b === undefined) b = 1; return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeIO(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function seg(t, a, b, e) { return (e || easeIO)(clamp((t - a) / (b - a), 0, 1)); }
  function fmt(n) { return Math.round(n).toLocaleString('en-US'); }
  function r1(n) { return Math.round(n * 10) / 10; }
  function fit(s, w, fs) { var max = Math.max(3, Math.floor(w / (fs * 0.55))); return s.length > max ? s.slice(0, max - 1) + '\u2026' : s; }

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- svg primitives ---------------- */
  function el(n, a, p) {
    var e = document.createElementNS(NS, n), k, v;
    if (a) for (k in a) { v = a[k]; if (v !== undefined && v !== null) e.setAttribute(k, v); }
    if (p) p.appendChild(e);
    return e;
  }
  function grp(p, a) { return el('g', a, p); }
  function box(p, x, y, w, h, a) {
    return el('rect', Object.assign({ x: r1(x), y: r1(y), width: Math.max(0, r1(w)), height: Math.max(0, r1(h)), rx: 9 }, a || {}), p);
  }
  function txt(p, x, y, s, a) {
    var t = el('text', Object.assign({ x: r1(x), y: r1(y), 'dominant-baseline': 'middle', 'font-size': 13, fill: '#e8eefc' }, a || {}), p);
    t.textContent = s;
    return t;
  }
  function ln(p, x1, y1, x2, y2, a) {
    return el('line', Object.assign({ x1: r1(x1), y1: r1(y1), x2: r1(x2), y2: r1(y2), stroke: '#334155', 'stroke-width': 1.6, 'stroke-linecap': 'round' }, a || {}), p);
  }
  function pathD(p, d, a) { return el('path', Object.assign({ d: d, fill: 'none', stroke: '#334155', 'stroke-width': 1.6, 'stroke-linecap': 'round' }, a || {}), p); }
  function dot(p, cx, cy, r, a) { return el('circle', Object.assign({ cx: r1(cx), cy: r1(cy), r: r1(r) }, a || {}), p); }

  var MARK = { cyan: '#22d3ee', violet: '#a78bfa', amber: '#fbbf24', green: '#34d399', rose: '#fb7185', slate: '#64748b' };
  var FILL = { cyan: 'rgba(34,211,238,.13)', violet: 'rgba(167,139,250,.14)', amber: 'rgba(251,191,36,.14)', green: 'rgba(52,211,153,.14)', rose: 'rgba(251,113,133,.14)', slate: 'rgba(148,163,184,.12)' };
  var INK = { cyan: '#d7fbff', violet: '#efe9ff', amber: '#fff6e0', green: '#e2fff4', rose: '#ffe9ee', slate: '#dfe7f5' };

  function wire(p, x1, y1, x2, y2, o) {
    o = o || {};
    var tone = o.tone || 'slate';
    var a = { stroke: MARK[tone], 'stroke-width': o.w || 1.6, opacity: o.op === undefined ? 1 : o.op };
    if (o.dash) a['stroke-dasharray'] = '5 5';
    if (o.arrow !== false) a['marker-end'] = 'url(#ah-' + tone + ')';
    return ln(p, x1, y1, x2, y2, a);
  }
  function wireV(p, x1, y1, x2, y2, o) {
    o = o || {};
    var tone = o.tone || 'slate';
    var a = { stroke: MARK[tone], 'stroke-width': o.w || 1.6, opacity: o.op === undefined ? 1 : o.op };
    if (o.arrow !== false) a['marker-end'] = 'url(#ah-' + tone + ')';
    return pathD(p, 'M' + r1(x1) + ',' + r1(y1) + ' V' + r1((y1 + y2) / 2) + ' H' + r1(x2) + ' V' + r1(y2), a);
  }
  function wireH(p, x1, y1, x2, y2, o) {
    o = o || {};
    var tone = o.tone || 'slate';
    var a = { stroke: MARK[tone], 'stroke-width': o.w || 1.6, opacity: o.op === undefined ? 1 : o.op };
    if (o.arrow !== false) a['marker-end'] = 'url(#ah-' + tone + ')';
    return pathD(p, 'M' + r1(x1) + ',' + r1(y1) + ' H' + r1((x1 + x2) / 2) + ' V' + r1(y2) + ' H' + r1(x2), a);
  }
  function autoChip(p, x, y, h, s, tone, op, fs) {
    fs = fs || 12.5;
    var w = Math.max(44, s.length * fs * 0.56 + 20);
    var g = grp(p, { opacity: op === undefined ? 1 : op });
    box(g, x, y, w, h, { fill: FILL[tone] || FILL.slate, stroke: MARK[tone] || MARK.slate, rx: h / 2, 'stroke-width': 1.2 });
    txt(g, x + w / 2, y + h / 2 + .5, s, { 'text-anchor': 'middle', 'font-size': fs, fill: (INK[tone] || INK.slate) });
    return w;
  }
  function panel(p, x, y, w, h, title, tone, op) {
    var g = grp(p, { opacity: op === undefined ? 1 : op });
    box(g, x, y, w, h, { fill: '#0e1830', stroke: '#2a3a5c', rx: 11 });
    box(g, x, y, w, 26, { fill: FILL[tone] || FILL.slate, stroke: 'none', rx: 11 });
    box(g, x, y + 16, w, 10, { fill: FILL[tone] || FILL.slate, stroke: 'none', rx: 0 });
    txt(g, x + 10, y + 13.5, fit(title, w - 20, 12), { 'font-size': 12, fill: INK[tone] || INK.slate, 'font-weight': 650 });
    return g;
  }
  function tile(p, x, y, w, h, tone, op) {
    var g = grp(p, { opacity: op === undefined ? 1 : op });
    box(g, x, y, w, h, { fill: FILL[tone] || FILL.slate, stroke: MARK[tone] || MARK.slate, rx: 7, 'stroke-width': 1.1 });
    var lw = w * 0.62, lh = Math.max(2, h * 0.08), i;
    for (i = 0; i < 3; i++) {
      box(g, x + w * 0.16, y + h * (0.28 + i * 0.21), i === 2 ? lw * 0.6 : lw, lh, { fill: MARK[tone] || MARK.slate, opacity: .55, rx: 2, stroke: 'none' });
    }
    return g;
  }
  function bars(p, x, y, w, h, n, op, tone) {
    var g = grp(p, { opacity: op === undefined ? 1 : op }), i, bw = w / n;
    for (i = 0; i < n; i++) {
      var v = 0.25 + 0.75 * Math.abs(Math.sin(i * 1.7 + 0.6));
      box(g, x + i * bw + bw * 0.15, y + h * (1 - v), bw * 0.7, h * v, { fill: MARK[tone || 'violet'], opacity: .75, rx: 1.5, stroke: 'none' });
    }
    return g;
  }
  function rowsOf(S, n, gap, fromY, height) {
    var top = fromY === undefined ? S.pad : fromY;
    var h = height === undefined ? (S.H - S.pad - top - (n - 1) * gap) / n : (height - (n - 1) * gap) / n;
    return { h: h, y: function (i) { return top + i * (h + gap); } };
  }
  function colsOf(S, n, gap, w) {
    var W = w === undefined ? S.W - 2 * S.pad : w;
    var cw = (W - (n - 1) * gap) / n;
    return { w: cw, x: function (i) { return S.pad + i * (cw + gap); } };
  }
  function typeOf(full, prog) { return full.slice(0, Math.round(full.length * clamp(prog))); }
  /* wraps on an estimated advance width, so long lines never run past the stage */
  function wrapText(p, x, y, w, str, o) {
    o = o || {};
    var fs = o.fs || 12.5, lh = o.lh || fs * 1.45, max = Math.max(4, Math.floor(w / (fs * 0.55)));
    var words = String(str).split(' '), lines = [], cur = '', i;
    for (i = 0; i < words.length; i++) {
      var test = cur ? cur + ' ' + words[i] : words[i];
      if (test.length > max && cur) { lines.push(cur); cur = words[i]; } else cur = test;
    }
    if (cur) lines.push(cur);
    var keep = lines.slice(0, o.max || 4);
    for (i = 0; i < keep.length; i++) txt(p, x, y + i * lh, keep[i], { 'font-size': fs, fill: o.fill || '#e8eefc', opacity: o.opacity });
    return keep.length;
  }

  /* wrapper that lays out either a vertical stack (phone) or a row (wide) */
  function flow(S, n, gap, boxTop, boxH) {
    var top = boxTop === undefined ? S.pad : boxTop;
    var avail = boxH === undefined ? (S.H - 2 * S.pad) : boxH;
    if (S.tall) {
      var h = (avail - (n - 1) * gap) / n;
      return { h: h, ax: function () { return S.pad; },
        size: function (i) { return { x: S.pad, y: top + i * (h + gap), w: S.W - 2 * S.pad, h: h }; } };
    }
    var w = (S.W - 2 * S.pad - (n - 1) * gap) / n;
    return { w: w, h: avail, ax: function (i) { return S.pad + i * (w + gap); },
      size: function (i) { return { x: S.pad + i * (w + gap), y: top, w: w, h: avail }; } };
  }

  /* ---------------- the eight steps ---------------- */
  var STEPS = [
    {
      title: '1. The corpus',
      sum: '100,000 documents in a dozen formats, with no common structure.',
      dur: 10,
      phases: [
        { label: 'Files land', cap: 'Documents arrive from drives, wikis, mailboxes and scanners. Nothing has been cleaned yet.' },
        { label: 'Formats are mixed', cap: 'Born-digital PDFs, <b>scans</b>, HTML pages, spreadsheets and mail exports sit side by side. The mix decides the parsing budget.' },
        { label: '100,000 documents', cap: 'The corpus is fixed before anything else: page count, format share and language mix become the denominator for every later claim.' }
      ],
      draw: function (p, t, S) {
        var cols = S.tall ? 4 : 8, rows = 3, gap = 6;
        var areaH = (S.H - 2 * S.pad) * (S.tall ? 0.46 : 0.56);
        var tw = (S.W - 2 * S.pad - (cols - 1) * gap) / cols;
        var th = (areaH - (rows - 1) * gap) / rows;
        var N = cols * rows, tones = ['cyan', 'violet', 'amber', 'green', 'rose', 'slate'], i, c, r, o;
        for (i = 0; i < N; i++) {
          o = seg(t, .02 + .42 * (i / N), .12 + .42 * (i / N));
          if (o <= 0) continue;
          c = i % cols; r = Math.floor(i / cols);
          tile(p, S.pad + c * (tw + gap), S.pad + r * (th + gap), tw, th, tones[i % 6], o);
        }
        var y = S.pad + areaH + 12, ch = 26;
        var items = [['PDF 62k', 'cyan'], ['Scan 14k', 'amber'], ['HTML 12k', 'violet'], ['Sheet 8k', 'green'], ['Mail 4k', 'rose']];
        var per = S.tall ? 3 : 5, x = S.pad, rowY = y;
        for (i = 0; i < items.length; i++) {
          if (i > 0 && i % per === 0) { rowY += ch + 6; x = S.pad; }
          o = seg(t, .34 + .05 * i, .46 + .05 * i);
          if (o > 0) x += autoChip(p, x, rowY, ch, items[i][0], items[i][1], o, 12.5) + 6;
        }
        var cy = rowY + ch + 18;
        var val = Math.round(100000 * seg(t, .6, .97, easeOut));
        txt(p, S.pad, cy, fmt(val), { 'font-size': S.tall ? 30 : 38, 'font-weight': 750, fill: '#eafeff' });
        txt(p, S.pad, cy + (S.tall ? 24 : 28), 'documents in the corpus', { 'font-size': 13, fill: '#93a1bd' });
      }
    },
    {
      title: '2. Manifest and dedupe',
      sum: 'Hash every file, then drop the copies before they are parsed.',
      dur: 10,
      phases: [
        { label: 'Hash every file', cap: 'A content hash per file turns "similar" into "identical". Filenames and timestamps are not trustworthy.' },
        { label: 'Copies collapse', cap: 'Typical corpora carry <b>8-15%</b> duplicates: shared drives, re-exports, the same PDF mailed twice.' },
        { label: 'The manifest', cap: 'What survives is a manifest of unique documents with their source path, hash and parse status. Everything downstream counts from here.' }
      ],
      draw: function (p, t, S) {
        var n = 6, gap = 8, cols = S.tall ? 3 : 6, rows = S.tall ? 2 : 1;
        var areaH = (S.H - 2 * S.pad) * (S.tall ? 0.42 : 0.5);
        var tw = (S.W - 2 * S.pad - (cols - 1) * gap) / cols;
        var th = (areaH - (rows - 1) * gap) / rows;
        var dup = { 1: 4, 2: 5 }, i, c, r, o, x, y, g;
        for (i = 0; i < n; i++) {
          o = seg(t, .02 + .05 * i, .14 + .05 * i);
          if (o <= 0) continue;
          c = i % cols; r = Math.floor(i / cols);
          x = S.pad + c * (tw + gap); y = S.pad + r * (th + gap);
          var isDup = !!dup[i];
          tile(p, x, y, tw, th, isDup ? 'rose' : 'cyan', o * (isDup ? seg(t, .58, .86) * 0.35 + 0.35 : 1));
          g = grp(p, { opacity: o });
          var hs = ['3f9a', '7c21', 'a04e', 'b7d3', '7c21', 'b7d3'][i];
          txt(g, x + 6, y + 12, '#' + hs, { 'font-size': 11, fill: isDup ? '#ffe9ee' : '#bfe9f5', 'font-family': 'ui-monospace,Menlo,monospace' });
        }
        var bucketY = S.pad + areaH + 16;
        var bx = S.pad, bw = autoChip(p, bx, bucketY, 28, 'duplicates dropped', 'rose', seg(t, .62, .8), 12.5);
        var total = 100000, uniq = 88412;
        var barY = bucketY + 46, barW = S.W - 2 * S.pad;
        var pr = seg(t, .7, .98, easeOut);
        box(p, S.pad, barY, barW, 16, { fill: '#0e1830', stroke: '#2a3a5c', rx: 8 });
        box(p, S.pad, barY, barW * lerp(0.116, 1, 1 - pr) * 0.999, 16, { fill: MARK.rose, opacity: .55, rx: 8, stroke: 'none' });
        box(p, S.pad, barY, barW * (0.116 + 0.884 * pr), 16, { fill: MARK.green, opacity: .55, rx: 8, stroke: 'none' });
        txt(p, S.pad, barY + 32, fmt(lerp(total, uniq, pr)) + ' unique documents kept', { 'font-size': 13, fill: INK.green });
      }
    },
    {
      title: '3. Tiered parsing',
      sum: 'Text layer first, OCR second, a vision model only where it pays.',
      dur: 11,
      phases: [
        { label: 'Try the text layer', cap: 'About <b>71%</b> of a mixed corpus still carries a real text layer. Extracting it is instant and free, so it goes first.' },
        { label: 'Fall back to OCR', cap: 'Scanned pages go to OCR: roughly <b>2 seconds a page</b>, and quality collapses on rotated or low-contrast scans.' },
        { label: 'Escalate to vision', cap: 'Only pages OCR mangles - tables, stamps, handwriting - go to a vision model at <b>20+ seconds and real cost</b>. Routing is the whole trick.' }
      ],
      draw: function (p, t, S) {
        var lanes = [
          { n: 'Text layer', m: '71% · instant', tone: 'cyan', share: .71, note: '71,000 docs' },
          { n: 'OCR', m: '22% · ~2s/page', tone: 'amber', share: .22, note: '22,000 docs' },
          { n: 'Vision model', m: '7% · 20s/page', tone: 'violet', share: .07, note: '7,000 docs' }
        ];
        var qn = 6, gap = 6;
        var queueH = S.tall ? 34 : 40;
        var qw = (S.W - 2 * S.pad - (qn - 1) * gap) / qn, i;
        for (i = 0; i < qn; i++) {
          var o = seg(t, .02 + .04 * i, .12 + .04 * i);
          if (o > 0) tile(p, S.pad + i * (qw + gap), S.pad, qw, queueH, 'slate', o);
        }
        txt(p, S.pad, S.pad + queueH + 14, 'incoming documents', { 'font-size': 12, fill: '#93a1bd' });
        var top = S.pad + queueH + 26;
        var avail = S.H - S.pad - top;
        var lh = (avail - 2 * 8) / 3;
        for (i = 0; i < 3; i++) {
          var L = lanes[i], y = top + i * (lh + 8);
          var op = seg(t, .18 + .16 * i, .34 + .16 * i);
          if (op <= 0) continue;
          panel(p, S.pad, y, S.W - 2 * S.pad, lh, L.n, L.tone, op);
          autoChip(p, S.pad + 10, y + 32, 22, L.m, L.tone, op * .9, 11.5);
          var show = seg(t, .3 + .2 * i, .52 + .2 * i);
          if (show > 0) txt(p, S.W - S.pad - 10, y + 43, L.note, { 'text-anchor': 'end', 'font-size': 12.5, fill: INK[L.tone], opacity: show });
          var dots = Math.max(3, Math.round(9 * L.share * 3));
          var dw = (S.W - 2 * S.pad - 24) / 10;
          var k, prog = seg(t, .34 + .2 * i, .62 + .2 * i);
          for (k = 0; k < dots; k++) {
            var kk = seg(t, .34 + .2 * i + .03 * k, .44 + .2 * i + .03 * k);
            if (kk > 0 && k * dw < (S.W - 2 * S.pad - 24) * prog + dw) {
              box(p, S.pad + 12 + k * dw, y + lh - 22, dw * 0.68, 10, { fill: MARK[L.tone], opacity: .7 * op, rx: 3, stroke: 'none' });
            }
          }
        }
      }
    },
    {
      title: '4. Structure-aware chunking',
      sum: 'Split on headings and tables, never mid-sentence, with overlap.',
      dur: 10,
      phases: [
        { label: 'Split on structure', cap: 'Chunks follow the document hierarchy: a heading keeps its section, a paragraph stays whole. Fixed 512-token windows cut sentences in half and hurt retrieval.' },
        { label: 'Keep tables whole', cap: 'A table is one chunk even when it exceeds the budget: splitting the header from its rows makes both halves unanswerable.' },
        { label: 'Overlap the edges', cap: 'A <b>60-token</b> overlap carries the sentence that straddles the boundary, so a fact split by the cut is still retrievable from one chunk.' }
      ],
      draw: function (p, t, S) {
        var pageH = (S.H - 2 * S.pad) * (S.tall ? 0.3 : 0.34);
        box(p, S.pad, S.pad, S.W - 2 * S.pad, pageH, { fill: '#0e1830', stroke: '#2a3a5c', rx: 10 });
        txt(p, S.pad + 10, S.pad + 15, 'annual-report-2024.pdf · page 41', { 'font-size': 11.5, fill: '#93a1bd' });
        var rows = [['H', .18], ['p', .28], ['p', .28], ['T', .34], ['p', .2]], acc = [0], i;
        var yy = S.pad + 26;
        for (i = 0; i < 5; i++) {
          var op = seg(t, .03 + .05 * i, .14 + .05 * i);
          if (op > 0) box(p, S.pad + 12, yy, (S.W - 2 * S.pad - 24) * rows[i][1] * 2.4, 7, { fill: i === 0 ? MARK.cyan : i === 3 ? MARK.amber : '#64748b', opacity: .7 * op, rx: 3, stroke: 'none' });
          yy += 13;
        }
        var cTop = S.pad + pageH + 18, cAvail = S.H - S.pad - cTop;
        var labels = [['§ 3.2 heading', 'cyan', 40], ['para · 180 tok', 'slate', 180], ['para · 210 tok', 'slate', 210], ['table · 512 tok', 'amber', 512], ['para · 120 tok', 'slate', 120]];
        var gapv = 6, ch = (cAvail - (labels.length - 1) * gapv) / labels.length;
        for (i = 0; i < labels.length; i++) {
          var cop = seg(t, .34 + .06 * i, .5 + .06 * i);
          if (cop <= 0) continue;
          var y = cTop + i * (ch + gapv);
          box(p, S.pad, y, S.W - 2 * S.pad, ch, { fill: FILL[labels[i][1]], stroke: MARK[labels[i][1]], rx: 8, 'stroke-width': 1.1, opacity: cop });
          txt(p, S.pad + 10, y + ch / 2, labels[i][0], { 'font-size': 12.5, fill: INK[labels[i][1]], opacity: cop });
          txt(p, S.W - S.pad - 10, y + ch / 2, labels[i][2] + ' tok', { 'text-anchor': 'end', 'font-size': 11.5, fill: '#93a1bd', opacity: cop });
          if (i > 0 && i < labels.length - 1 && t > .66) {
            var ov = seg(t, .68 + .04 * i, .8 + .04 * i);
            box(p, S.pad + 2, y - gapv / 2 - 1.5, (S.W - 2 * S.pad) * 0.5 * ov, 3, { fill: MARK.amber, opacity: .8, rx: 2, stroke: 'none' });
          }
        }
      }
    },
    {
      title: '5. Enrichment and embedding',
      sum: 'Every chunk gets metadata, a summary and a vector.',
      dur: 11,
      phases: [
        { label: 'Attach metadata', cap: 'Section path, page, language, document type and updated-at are lifted from the parse. They become the filters that make retrieval cheap later.' },
        { label: 'Write a summary', cap: 'A one-line summary per chunk gives the reranker and the answer model a cheap first look at context they cannot afford to read in full.' },
        { label: 'Embed the chunk', cap: 'The chunk becomes a <b>768-dimension</b> vector. Same text, same vector - which is what makes the index reproducible after a re-embed.' }
      ],
      draw: function (p, t, S) {
        var headH = 34;
        box(p, S.pad, S.pad, S.W - 2 * S.pad, headH, { fill: FILL.cyan, stroke: MARK.cyan, rx: 8, 'stroke-width': 1.1 });
        txt(p, S.pad + 10, S.pad + headH / 2, 'chunk #41-003 · "Refund policy"', { 'font-size': 12.5, fill: INK.cyan });
        var top = S.pad + headH + 16, avail = S.H - S.pad - top;
        if (S.tall) {
          var h1 = avail * 0.3, h2 = avail * 0.28, h3 = avail - h1 - h2 - 16;
          this._meta(p, t, S, S.pad, top, S.W - 2 * S.pad, h1);
          this._sum(p, t, S, S.pad, top + h1 + 8, S.W - 2 * S.pad, h2);
          this._vec(p, t, S, S.pad, top + h1 + h2 + 16, S.W - 2 * S.pad, h3);
        } else {
          var w = (S.W - 2 * S.pad - 16) / 2;
          this._meta(p, t, S, S.pad, top, w, avail * 0.46);
          this._sum(p, t, S, S.pad, top + avail * 0.46 + 10, w, avail * 0.54 - 10);
          this._vec(p, t, S, S.pad + w + 16, top, w, avail);
        }
      },
      _meta: function (p, t, S, x, y, w, h) {
        var g = panel(p, x, y, w, h, 'metadata', 'cyan', seg(t, .04, .18));
        var items = ['section: 4.2 Refunds', 'page: 41', 'lang: en', 'type: policy_pdf', 'updated: 2024-11-02'];
        var room = Math.max(1, Math.floor((h - 40) / 15));
        var show = items.slice(0, Math.min(items.length, room));
        var step = Math.max(15, (h - 40) / Math.max(1, show.length - 1 || 1));
        var cy = y + 34, i;
        for (i = 0; i < show.length; i++) {
          var o = seg(t, .1 + .05 * i, .24 + .05 * i);
          if (o > 0) txt(g, x + 10, cy, fit(show[i], w - 20, 11.5), { 'font-size': 11.5, fill: '#cfe0ff', opacity: o, 'font-family': 'ui-monospace,Menlo,monospace' });
          cy += step;
        }
        if (show.length < items.length && h > 40 + show.length * 15 + 18) txt(g, x + 10, y + h - 14, '\u2026', { 'font-size': 11.5, fill: '#93a1bd' });
      },
      _sum: function (p, t, S, x, y, w, h) {
        var g = panel(p, x, y, w, h, 'summary', 'green', seg(t, .22, .36));
        var line = 'Refunds are issued within 5 business days and require an order id.';
        var prog = seg(t, .3, .62);
        var max = Math.max(12, Math.floor((w - 20) / (12 * 0.55)));
        var two = h > 100;
        txt(g, x + 10, y + 40, typeOf(line, prog).slice(0, max), { 'font-size': 12, fill: INK.green });
        if (two) txt(g, x + 10, y + 58, typeOf(line.slice(max), prog > .5 ? (prog - .5) * 2 : 0), { 'font-size': 12, fill: INK.green });
        if (two) {
          dot(g, x + 14, y + h - 16, 4, { fill: MARK.green, opacity: prog >= 1 ? .9 : .25 });
          txt(g, x + 24, y + h - 16, 'distilled, not stored as truth', { 'font-size': 11, fill: '#93a1bd' });
        }
      },
      _vec: function (p, t, S, x, y, w, h) {
        var o = seg(t, .46, .66);
        var g = panel(p, x, y, w, h, 'embedding · 768 dims', 'violet', o);
        if (o <= 0) return;
        var bw = w - 20, bh = Math.min(h * 0.42, 90);
        bars(g, x + 10, y + 40, bw, bh, S.tall ? 32 : 48, seg(t, .5, .8), 'violet');
        autoChip(g, x + 10, y + h - 34, 24, 'normalised, cosine ready', 'violet', seg(t, .8, .95), 11.5);
      }
    },
    {
      title: '6. Storage and indexes',
      sum: 'Three indexes over the same chunks: vectors, terms, metadata.',
      dur: 10,
      phases: [
        { label: 'Vector index', cap: 'HNSW keeps the vectors in a navigable graph: search touches a few hundred nodes instead of comparing 88,412 vectors.' },
        { label: 'Lexical index', cap: 'An inverted index of terms and posting lists answers exact matches - order codes, product names, error strings - that embeddings blur away.' },
        { label: 'Metadata store', cap: 'Filters live here. Narrowing to one section or one year before searching is the cheapest speed-up in the pipeline.' }
      ],
      draw: function (p, t, S) {
        var headH = 30;
        box(p, S.pad, S.pad, S.W - 2 * S.pad, headH, { fill: FILL.slate, stroke: MARK.slate, rx: 8, 'stroke-width': 1.1 });
        txt(p, S.pad + 10, S.pad + headH / 2, '88,412 chunks · vectors + terms + metadata', { 'font-size': 12, fill: INK.slate });
        var top = S.pad + headH + 14, avail = S.H - S.pad - 36 - top;
        var H = flow(S, 3, 10, top, avail);
        var i;
        for (i = 0; i < 3; i++) {
          var r = H.size(i), o = seg(t, .06 + .12 * i, .22 + .12 * i);
          if (o <= 0) continue;
          if (i === 0) this._hnsw(p, t, S, r.x, r.y, r.w, r.h, o);
          else if (i === 1) this._bm25(p, t, S, r.x, r.y, r.w, r.h, o);
          else this._meta(p, t, S, r.x, r.y, r.w, r.h, o);
        }
        autoChip(p, S.pad, S.H - S.pad - 26, 26, 'one chunk id joins all three', 'green', seg(t, .72, .92), 12);
      },
      _hnsw: function (p, t, S, x, y, w, h, o) {
        var g = panel(p, x, y, w, h, 'vector index · HNSW', 'violet', o);
        var layers = 3, i, k;
        for (i = 0; i < layers; i++) {
          var ly = y + 38 + i * ((h - 48) / layers);
          var cnt = 9 - i * 3, dw = (w - 24) / cnt;
          var oo = seg(t, .2 + .1 * i, .4 + .1 * i);
          for (k = 0; k < cnt; k++) {
            var cx = x + 12 + k * dw + dw / 2;
            dot(g, cx, ly, 3.4, { fill: MARK.violet, opacity: .85 * oo });
            if (o > 0 && i < layers - 1) ln(g, cx, ly + 4, x + 12 + ((k * 2) % cnt) * dw + dw / 2, ly + (h - 48) / layers - 4, { stroke: MARK.violet, 'stroke-width': 1, opacity: .3 * oo });
          }
        }
        txt(g, x + 10, y + h - 12, 'few hundred nodes touched per query', { 'font-size': 11, fill: '#93a1bd' });
      },
      _bm25: function (p, t, S, x, y, w, h, o) {
        var g = panel(p, x, y, w, h, 'lexical index · inverted', 'cyan', o);
        var terms = ['refund', 'invoice', 'order id'], i;
        var cy = y + 38;
        for (i = 0; i < terms.length; i++) {
          var oo = seg(t, .18 + .1 * i, .36 + .1 * i);
          if (oo <= 0) continue;
          txt(g, x + 10, cy, terms[i], { 'font-size': 11.5, fill: INK.cyan, 'font-family': 'ui-monospace,Menlo,monospace', opacity: oo });
          box(g, x + 10 + w * 0.34, cy - 5, (w - 20) * 0.56 * seg(t, .26 + .1 * i, .46 + .1 * i), 10, { fill: MARK.cyan, opacity: .6 * oo, rx: 3, stroke: 'none' });
          cy += Math.max(15, (h - 46) / terms.length);
        }
      },
      _meta: function (p, t, S, x, y, w, h, o) {
        var g = panel(p, x, y, w, h, 'metadata store · filters', 'green', o);
        var rows = [['section', '4.2 Refunds'], ['year', '2024'], ['type', 'policy_pdf']], i;
        var cy = y + 40;
        for (i = 0; i < rows.length; i++) {
          var oo = seg(t, .18 + .1 * i, .36 + .1 * i);
          txt(g, x + 10, cy, rows[i][0], { 'font-size': 11, fill: '#93a1bd', opacity: oo });
          txt(g, x + w * 0.42, cy, rows[i][1], { 'font-size': 11.5, fill: INK.green, opacity: oo });
          ln(g, x + 8, cy + 9, x + w - 8, cy + 9, { stroke: '#2a3a5c', 'stroke-width': 1, opacity: oo });
          cy += Math.max(15, (h - 46) / rows.length);
        }
      }
    },
    {
      title: '7. Hybrid retrieval and rerank',
      sum: 'Two searches, one fused ranking, then a cross-encoder cuts to eight.',
      dur: 12,
      phases: [
        { label: 'Two indexes answer', cap: 'The query hits the lexical and the vector index at once. Each returns <b>100 candidates</b>; neither list alone is good enough.' },
        { label: 'Fuse the rankings', cap: 'Reciprocal rank fusion scores by <i>position</i>, not raw score: rank 1 in both lists beats rank 1 in one. Forty candidates survive.' },
        { label: 'Rerank to eight', cap: 'A cross-encoder reads the query and each candidate together and trims forty down to the <b>eight</b> passages the answer model will actually see.' }
      ],
      draw: function (p, t, S) {
        var h = flow(S, S.tall ? 5 : 4, 8);
        var i;
        if (S.tall) {
          var q = h.size(0);
          box(p, q.x, q.y, q.w, q.h, { fill: FILL.amber, stroke: MARK.amber, rx: 9, 'stroke-width': 1.2 });
          txt(p, q.x + 10, q.y + q.h / 2, fit('"how long do refunds take?"', q.w - 20, 12.5), { 'font-size': 12.5, fill: INK.amber });
          var b = h.size(1), half = (b.w - 6) / 2;
          this._rung(p, t, S, b.x, b.y, half, b.h, 'BM25 top 100', 'cyan', .12);
          this._rung(p, t, S, b.x + half + 6, b.y, half, b.h, 'vector top 100', 'violet', .2);
          var r2 = h.size(2), r3 = h.size(3), r4 = h.size(4);
          this._rung(p, t, S, r2.x, r2.y, r2.w, r2.h, 'fusion · 40 candidates', 'green', .46);
          this._rung(p, t, S, r3.x, r3.y, r3.w, r3.h, 'rerank · top 8', 'rose', .6);
          this._rung(p, t, S, r4.x, r4.y, r4.w, r4.h, 'to the answer model', 'amber', .74);
        } else {
          var col = flow(S, 4, 10);
          var a = col.size(0);
          box(p, a.x, a.y + a.h * 0.3, a.w, 40, { fill: FILL.amber, stroke: MARK.amber, rx: 9, 'stroke-width': 1.2 });
          txt(p, a.x + 8, a.y + a.h * 0.3 + 20, 'query', { 'font-size': 12, fill: INK.amber });
          this._rung(p, t, S, a.x, a.y + a.h * 0.55, a.w, 42, 'BM25 top 100', 'cyan', .14);
          this._rung(p, t, S, col.ax(1), a.y + a.h * 0.3, col.w, 40, 'rank fusion', 'green', .44);
          this._rung(p, t, S, col.ax(2), a.y + a.h * 0.3, col.w, 40, 'rerank → 8', 'rose', .58);
          this._rung(p, t, S, col.ax(3), a.y + a.h * 0.3, col.w, 40, 'answer model', 'amber', .72);
          this._rung(p, t, S, a.x, a.y + a.h * 0.75, a.w, 42, 'vector top 100', 'violet', .24);
        }
      },
      _rung: function (p, t, S, x, y, w, hh, label, tone, at) {
        var o = seg(t, at, at + .16);
        if (o <= 0) return;
        box(p, x, y, w, hh, { fill: FILL[tone], stroke: MARK[tone], rx: 9, 'stroke-width': 1.2, opacity: o });
        txt(p, x + 10, y + hh / 2, fit(label, w - 20, 12.5), { 'font-size': 12.5, fill: INK[tone], opacity: o });
        if (at > .4) txt(p, x + w - 10, y + hh / 2, fmt(Math.round(100 * seg(t, at, at + .2))), { 'text-anchor': 'end', 'font-size': 12, fill: '#bcd3e8', opacity: o });
      }
    },
    {
      title: '8. Grounded answer',
      sum: 'Eight passages in, one cited answer out - or an honest refusal.',
      dur: 12,
      phases: [
        { label: 'Assemble context', cap: 'The eight passages are pasted in rank order with an id each. Nothing else from the corpus can reach the model.' },
        { label: 'Answer with citations', cap: 'Every sentence in the answer carries the passage id it came from, so a reader can check the claim in one tap.' },
        { label: 'Refuse when unsupported', cap: 'If the passages do not support an answer the pipeline says so. A confident wrong answer costs more than a refusal.' }
      ],
      draw: function (p, t, S) {
        var passN = 8;
        var ctxH = (S.H - 2 * S.pad) * (S.tall ? 0.46 : 0.52);
        var gapv = 4, ph = (ctxH - (passN - 1) * gapv) / passN, i;
        for (i = 0; i < passN; i++) {
          var o = seg(t, .02 + .04 * i, .16 + .04 * i);
          if (o <= 0) continue;
          var y = S.pad + i * (ph + gapv);
          var cited = i < 3;
          box(p, S.pad, y, S.W - 2 * S.pad, ph, { fill: cited ? FILL.green : FILL.slate, stroke: cited ? MARK.green : '#2a3a5c', rx: 6, 'stroke-width': 1, opacity: o });
          txt(p, S.pad + 8, y + ph / 2, '[' + (i + 1) + '] ' + (i === 0 ? 'Refund policy §4.2 · p41' : i === 1 ? 'Order terms §7 · p88' : i === 2 ? 'Support FAQ · refund timing' : 'passage ' + (i + 1)), { 'font-size': 11.5, fill: cited ? INK.green : '#93a1bd', opacity: o });
        }
        var top = S.pad + ctxH + 16, avail = S.H - S.pad - top;
        var o2 = seg(t, .3, .44);
        if (o2 > 0) {
          box(p, S.pad, top, S.W - 2 * S.pad, avail * (S.tall ? 0.52 : 0.56), { fill: '#0e1830', stroke: '#2a3a5c', rx: 10, opacity: o2 });
          txt(p, S.pad + 10, top + 14, 'answer', { 'font-size': 11, fill: '#93a1bd', opacity: o2 });
          var ans1 = 'Refunds are processed within 5 business days of approval [1][2]. An order id is required [1].';
          var prog = seg(t, .38, .84);
          wrapText(p, S.pad + 10, top + 36, S.W - 2 * S.pad - 20, typeOf(ans1, prog), { fs: 12.5, lh: 17, fill: INK.green, opacity: o2, max: 3 });
          var gy = top + avail * (S.tall ? 0.52 : 0.56) + 10;
          var og = seg(t, .86, .96);
          if (og > 0) autoChip(p, S.pad, gy, 26, 'no support → "I cannot answer that"', 'rose', og, 12);
        }
      }
    }
  ];

  /* ---------------- ui ---------------- */
  var svg = $('#stage'), chipsEl = $('#chips'), phasesEl = $('#phases'), capEl = $('#caption'),
    titleEl = $('#step-title'), sumEl = $('#step-sum'), scrub = $('#scrub'), playBtn = $('#play'),
    prevBtn = $('#prev'), nextBtn = $('#next');

  var idx = 0, t = 0, playing = false, last = 0, raf = 0, W = 800, H = 480, S = {}, rootEl = null;

  function defs() {
    var d = el('defs', null, svg), i, tones = ['cyan', 'violet', 'amber', 'green', 'rose', 'slate'];
    for (i = 0; i < tones.length; i++) {
      var m = el('marker', { id: 'ah-' + tones[i], viewBox: '0 0 8 8', refX: 6.5, refY: 4, markerWidth: 5.5, markerHeight: 5.5, orient: 'auto-start-reverse' }, d);
      el('path', { d: 'M0,1 L6.5,4 L0,7 z', fill: MARK[tones[i]] }, m);
    }
  }
  function measure() {
    var r = svg.getBoundingClientRect();
    W = Math.max(240, Math.round(r.width));
    H = Math.max(220, Math.round(r.height));
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    S = { W: W, H: H, pad: W < 420 ? 12 : 16, tall: W < 620 || H > W * 1.05 };
  }
  function render() {
    if (rootEl) svg.removeChild(rootEl);          /* keep <title> and <defs> */
    var title = svg.querySelector('title');
    rootEl = el('g', null, svg);
    var root = rootEl;
    try { STEPS[idx].draw(root, t, S); } catch (e) { if (window.console) console.warn('draw', e); }
    title.textContent = STEPS[idx].title + ' — ' + STEPS[idx].sum;
  }
  function phaseIndex() { return Math.min(STEPS[idx].phases.length - 1, Math.floor(t * STEPS[idx].phases.length)); }
  function paintChrome() {
    var st = STEPS[idx], pi = phaseIndex(), i;
    titleEl.textContent = st.title;
    sumEl.textContent = st.sum;
    capEl.innerHTML = st.phases[pi].cap;
    Array.prototype.forEach.call(phasesEl.children, function (b, k) { b.setAttribute('aria-current', String(k === pi)); });
    Array.prototype.forEach.call(chipsEl.children, function (li, k) {
      var b = li.firstChild;
      if (k === idx) { b.setAttribute('aria-current', 'step'); if (!chipsEl.dataset.scrolled) { chipsEl.dataset.scrolled = '1'; } }
      else b.removeAttribute('aria-current');
    });
    scrub.value = String(Math.round(t * 1000));
    scrub.setAttribute('aria-valuetext', Math.round(t * 100) + '% of this step');
    playBtn.textContent = playing ? 'Pause' : 'Play';
    playBtn.setAttribute('aria-pressed', String(playing));
    prevBtn.disabled = idx === 0;
    nextBtn.disabled = idx === STEPS.length - 1;
  }
  function build() {
    STEPS.forEach(function (st, i) {
      var li = document.createElement('li'), b = document.createElement('button');
      b.type = 'button'; b.textContent = st.title; b.title = st.sum;
      b.addEventListener('click', function () { load(i, 0); });
      li.appendChild(b); chipsEl.appendChild(li);
    });
  }
  function buildPhases() {
    phasesEl.textContent = '';
    STEPS[idx].phases.forEach(function (ph, k) {
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = ph.label;
      b.addEventListener('click', function () {
        var n = STEPS[idx].phases.length;
        load(idx, k / n + 0.02);
      });
      phasesEl.appendChild(b);
    });
  }
  function load(i, at) {
    idx = clamp(i, 0, STEPS.length - 1);
    t = REDUCED ? 1 : (at === undefined ? 0 : at);
    buildPhases();
    history.replaceState(null, '', '#s=' + (idx + 1));
    var active = chipsEl.children[idx].firstChild;
    if (active.scrollIntoView) try { active.scrollIntoView({ inline: 'center', block: 'nearest' }); } catch (e) { }
    render(); paintChrome();
  }
  function frame(ts) {
    raf = 0;
    if (!playing) return;
    if (!last) last = ts;
    var dt = Math.min(0.05, (ts - last) / 1000); last = ts;
    var prev = t;
    t += dt / STEPS[idx].dur;
    if (t >= 1) {
      t = 1;
      if (idx < STEPS.length - 1) { load(idx + 1, 0); last = ts; }
      else { playing = false; setPlaying(false); }
    }
    if (t !== prev) { render(); paintChrome(); }
    if (playing) raf = requestAnimationFrame(frame);
  }
  function setPlaying(v) {
    playing = v && !REDUCED;
    last = 0;
    if (playing && !raf) raf = requestAnimationFrame(frame);
    paintChrome();
  }
  function fromHash() {
    var m = /s=(\d+)/.exec(location.hash);
    var n = m ? parseInt(m[1], 10) - 1 : 0;
    load(isNaN(n) ? 0 : n, 0);
  }

  defs(); measure(); build();
  fromHash();
  setPlaying(true);

  scrub.addEventListener('input', function () {
    var v = parseInt(scrub.value, 10);            /* read first: setPlaying() repaints and would reset it */
    setPlaying(false);
    t = clamp(v / 1000);
    render(); paintChrome();
  });
  playBtn.addEventListener('click', function () { if (t >= 1 && idx === STEPS.length - 1) { load(0, 0); } setPlaying(!playing); });
  prevBtn.addEventListener('click', function () { setPlaying(false); load(idx - 1, 0); });
  nextBtn.addEventListener('click', function () { setPlaying(false); load(idx + 1, 0); });
  document.addEventListener('keydown', function (e) {
    if (e.target && /input|select|textarea/i.test(e.target.tagName)) return;
    if (e.key === 'ArrowRight') { setPlaying(false); load(idx + 1, 0); }
    else if (e.key === 'ArrowLeft') { setPlaying(false); load(idx - 1, 0); }
    else if (e.key === ' ') { e.preventDefault(); setPlaying(!playing); }
  });
  window.addEventListener('hashchange', fromHash);
  document.addEventListener('visibilitychange', function () { if (document.hidden) setPlaying(false); });
  if (window.ResizeObserver) new ResizeObserver(function () { measure(); render(); }).observe(svg);
  else window.addEventListener('resize', function () { measure(); render(); });
})();
