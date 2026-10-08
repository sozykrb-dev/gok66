import '@fontsource/playpen-sans-arabic/400.css';
import '@fontsource/playpen-sans-arabic/700.css';
import '@fontsource/aref-ruqaa/400.css';
import '@fontsource/aref-ruqaa/700.css';
import './style.css';
import { createElement, BookOpenText, Search, Eraser, Zap, Link2, BadgeCheck, CircleDashed, CircleHelp } from 'lucide';
import { analyze } from './analyzer.js';

const ICONS = { logo: BookOpenText, search: Search, eraser: Eraser, verb: Zap, part: Link2, def: BadgeCheck, ind: CircleDashed, neu: CircleHelp };
const icon = k => createElement(ICONS[k]);
document.querySelectorAll('[data-icon]').forEach(n => n.prepend(icon(n.dataset.icon)));

const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x !== undefined) e.textContent = x; return e; };

function tagOf(p) {
  if (p.k === 'verb') return ['فعل', 't-verb', 'verb'];
  if (p.k === 'part') return ['حرف', 't-part', 'part'];
  if (p.d === 'معرفة') return ['اسم معرفة', 't-def', 'def'];
  if (p.d === 'نكرة') return ['اسم نكرة', 't-ind', 'ind'];
  return ['اسم (' + (p.d || '') + ')', 't-neu', 'neu'];
}
function tag(p) {
  const [n, c, i] = tagOf(p);
  const s = el('span', 'tag ' + c);
  s.append(icon(i), n);
  return s;
}

function run() {
  const out = document.getElementById('out'); out.textContent = '';
  const toks = inp.value.replace(/[.,،؟?!؛:;"()«»\[\]]/g, ' ').split(/\s+/).filter(Boolean);
  if (!toks.length) { out.appendChild(el('p', 'hint', 'اكتب كلمة أو جملة أولًا.')); return; }
  const res = toks.map((t, i) => ({ t, P: analyze(t, toks[i - 1], toks[i + 1]) }));
  const first = res.find(r => r.P[0].k !== 'part');
  const sum = el('div', 'sum');
  if (first) {
    sum.append(el('span', '', 'نوع الجملة الأرجح:'), el('b', '', first.P[0].k === 'verb' ? 'جملة فعلية' : 'جملة اسمية'));
  }
  const cnt = {};
  res.forEach(r => { const k = tagOf(r.P[0])[0]; cnt[k] = (cnt[k] || 0) + 1; });
  res.forEach(() => {});
  [...new Set(res.map(r => r.P[0]).map(p => tagOf(p)[0]))].forEach(n => {
    const p = res.map(r => r.P[0]).find(x => tagOf(x)[0] === n);
    const t = tag(p); t.append(': ' + cnt[n]); sum.appendChild(t);
  });
  out.appendChild(sum);
  res.forEach(r => {
    const card = el('div', 'card sel'), head = el('div', 'head');
    head.append(el('span', 'w', r.t), tag(r.P[0]));
    card.appendChild(head);
    const ul = el('ul', 'opts');
    r.P.slice(0, 6).forEach((p, i) => {
      const li = el('li', 'opt'), lab = el('div', 'lab');
      lab.append(tag(p), el('span', '', p.l));
      if (i === 0 && r.P.length > 1) lab.appendChild(el('span', 'top', 'الأرجح'));
      const bar = el('div', 'bar'), b = el('i'); b.style.width = Math.min(100, p.s) + '%'; bar.appendChild(b);
      li.append(lab, bar);
      if (p.n) li.appendChild(el('p', 'note', p.n));
      ul.appendChild(li);
    });
    card.appendChild(ul); out.appendChild(card);
  });
}

const inp = document.getElementById('inp');
document.getElementById('go').onclick = run;
document.getElementById('clr').onclick = () => { inp.value = ''; document.getElementById('out').textContent = ''; inp.focus(); };
inp.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); run(); } });
['كتب الطالب الدرس', 'ذهبت إلى المدرسة', 'كتاب الطالب', 'يا محمد', 'هذا كتابٌ جديدٌ', 'سيكتبون الواجب', 'ما الذي حدث', 'علي'].forEach(s => {
  const b = el('button', 'chip', s); b.onclick = () => { inp.value = s; run(); }; document.getElementById('ex').appendChild(b);
});
