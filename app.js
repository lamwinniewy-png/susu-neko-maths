/* Susu & Neko Maths Playland */
(() => {
'use strict';
// ---------- state ----------
const store = {
  get(k, d) { try { return JSON.parse(window['local'+'Storage'].getItem('snm_'+k)) ?? d; } catch(e){ return mem[k] ?? d; } },
  set(k, v) { mem[k]=v; try { window['local'+'Storage'].setItem('snm_'+k, JSON.stringify(v)); } catch(e){} }
};
const mem = {};
let lang = store.get('lang','zh');
let sound = store.get('sound', true);
let stars = store.get('stars', 0);
let stickers = store.get('stickers', {});
let done = store.get('done', {});
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const T = k => (UI[k] ? UI[k][lang==='zh'?0:1] : k);
const L2 = (zh, en) => lang==='zh' ? zh : en;
const shuffle = a => { a=[...a]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
const pick = a => a[Math.floor(Math.random()*a.length)];
const rnd = (a,b) => a + Math.floor(Math.random()*(b-a+1));
const STAR = '<svg viewBox="0 0 24 24"><path fill="#ffd25e" stroke="#efb52a" stroke-width="1.2" d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 20.9l1.6-7L2 9.2l7.1-.6z"/></svg>';
const STAR0 = '<svg viewBox="0 0 24 24"><path fill="#eee" stroke="#ddd" stroke-width="1.2" d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 20.9l1.6-7L2 9.2l7.1-.6z"/></svg>';
const SPK = '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 8.5a5 5 0 010 7" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>';

// ---------- audio ----------
let audio = new Audio(); let lastKey = null; let actx = null;
function speak(key, opts={}) {
  const line = LINES[key] || (key.startsWith('v_') ? null : null);
  let text, who;
  if (key.startsWith('v_')) { const v = VOCAB[key.slice(2)]; text = lang==='zh' ? `${v.zh}　${v.en}` : v.en; who = opts.who || 's'; }
  else if (line) { text = line[lang]; who = line.sp; }
  else return;
  lastKey = key;
  showBuddy(who, opts.mood || 'idle', text);
  if (!sound) return;
  try { audio.pause(); } catch(e){}
  audio = new Audio(`audio/${lang}_${key}.mp3`);
  const b = $('#buddy');
  audio.onplay = () => b.classList.add('talk');
  audio.onended = audio.onpause = () => b.classList.remove('talk');
  audio.play().catch(()=>{});
}
function blip(type) {
  if (!sound) return;
  try {
    actx = actx || new (window.AudioContext||window.webkitAudioContext)();
    const notes = type==='good' ? [660,880,1175] : type==='bad' ? [300,220] : type==='flip' ? [520] : [880,1100,1320,1760];
    notes.forEach((f,i)=>{
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type==='bad' ? 'triangle' : 'sine'; o.frequency.value = f;
      const t = actx.currentTime + i*0.09;
      g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(0.18,t+0.02); g.gain.exponentialRampToValueAtTime(0.0001,t+0.22);
      o.connect(g).connect(actx.destination); o.start(t); o.stop(t+0.25);
    });
  } catch(e){}
}
const IMG = { s:{idle:'susu', good:'susu_cheer', think:'susu_think', arms:'susu_arms'}, n:{idle:'neko', good:'neko_cheer', think:'neko_think', arms:'neko'} };
let bubbleTimer;
function showBuddy(who, mood, text) {
  const b = $('#buddy'); b.hidden = false;
  b.classList.toggle('n', who==='n');
  $('#buddyImg').src = `img/${IMG[who][mood]||IMG[who].idle}.webp`;
  $('#buddyImg').alt = who==='n' ? 'Neko' : 'Susu';
  $('#bubbleText').textContent = text;
  const bub = $('#bubble'); bub.classList.remove('hide');
  b.classList.remove('jump'); void b.offsetWidth; if (mood==='good') b.classList.add('jump');
  clearTimeout(bubbleTimer); bubbleTimer = setTimeout(()=>bub.classList.add('hide'), innerWidth<700 ? Math.max(4000, text.length*160) : 9000);
}
function praise(){ blip('good'); speak(pick(['ok1','ok2','ok3','ok4','ok5']), {mood:'good'}); }
function oops(){ blip('bad'); speak(pick(['no1','no2','no3']), {mood:'think'}); }
function addStar(n=1){ stars+=n; store.set('stars',stars); const s=$('.starcount'); $('#starNum').textContent=stars; s.classList.remove('pop'); void s.offsetWidth; s.classList.add('pop'); }
function confetti(){
  const c=$('#confetti'); const cols=['#ff5d73','#9b7bf0','#ffd25e','#5fd3b3','#6cc4ff','#ff9f5a'];
  for(let i=0;i<70;i++){ const e=document.createElement('i'); e.style.left=Math.random()*100+'vw'; e.style.background=pick(cols); e.style.animationDelay=Math.random()*0.6+'s'; e.style.animationDuration=(1.4+Math.random()*1.2)+'s'; c.appendChild(e); setTimeout(()=>e.remove(),3200); }
}

// ---------- SVG helpers ----------
const rad = d => d*Math.PI/180;
function angleSVG(deg, o={}) {
  const w=o.w||200,h=o.h||150, len=o.len||110, rot=o.rot||0, cx=o.cx ?? (deg>100? w/2+10 : 45), cy=o.cy ?? h-25, col=o.col||'#3a2c4a', lbl=o.label;
  const a1=rad(-rot), a2=rad(-(rot+deg));
  const p1=[cx+len*Math.cos(a1), cy+len*Math.sin(a1)], p2=[cx+(o.len2||len)*Math.cos(a2), cy+(o.len2||len)*Math.sin(a2)];
  let mark='';
  if (Math.abs(deg-90)<0.5 && !o.arcOnly) {
    const s=16, q1=[cx+s*Math.cos(a1),cy+s*Math.sin(a1)], q2=[cx+s*Math.cos(a2),cy+s*Math.sin(a2)], q3=[q1[0]+q2[0]-cx,q1[1]+q2[1]-cy];
    mark=`<path d="M${q1} L${q3} L${q2}" fill="none" stroke="${o.mc||'#ff5d73'}" stroke-width="3"/>`;
  } else if (!o.noArc) {
    const r=o.r||24, s1=[cx+r*Math.cos(a1),cy+r*Math.sin(a1)], s2=[cx+r*Math.cos(a2),cy+r*Math.sin(a2)];
    mark=`<path d="M${cx},${cy} L${s1} A${r},${r} 0 ${deg>180?1:0} 0 ${s2} Z" fill="${o.fill||'rgba(155,123,240,.35)'}" stroke="${o.mc||'#9b7bf0'}" stroke-width="2.5"/>`;
  }
  const t = lbl ? `<text x="${cx+ (o.r||24)*1.9*Math.cos(rad(-(rot+deg/2)))}" y="${cy+(o.r||24)*1.9*Math.sin(rad(-(rot+deg/2)))+7}" font-size="22" font-weight="700" text-anchor="middle" fill="${col}">${lbl}</text>` : '';
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="angle">${mark}<line x1="${cx}" y1="${cy}" x2="${p1[0]}" y2="${p1[1]}" stroke="${col}" stroke-width="5" stroke-linecap="round"/><line x1="${cx}" y1="${cy}" x2="${p2[0]}" y2="${p2[1]}" stroke="${col}" stroke-width="5" stroke-linecap="round"/>${t}</svg>`;
}
// generic angle fitted in box: compute vertex placement to keep in view
function fitAngle(deg, rot, o={}) {
  const w=o.w||200,h=o.h||150,len=o.len||100;
  const pts=[[0,0],[len*Math.cos(rad(-rot)),len*Math.sin(rad(-rot))],[len*Math.cos(rad(-(rot+deg))),len*Math.sin(rad(-(rot+deg)))]];
  const xs=pts.map(p=>p[0]), ys=pts.map(p=>p[1]);
  const minx=Math.min(...xs),maxx=Math.max(...xs),miny=Math.min(...ys),maxy=Math.max(...ys);
  const cx = (w-(maxx-minx))/2 - minx, cy=(h-(maxy-miny))/2 - miny;
  return angleSVG(deg, {...o, w,h,len, rot, cx, cy});
}
function polySVG(pts, o={}) {
  const w=o.w||200,h=o.h||160;
  let marks='';
  if (o.marks) {
    const n=pts.length;
    for (let i=0;i<n;i++){
      if (o.curve && o.curve.includes(i)) continue;
      const p=pts[i], a=pts[(i-1+n)%n], b=pts[(i+1)%n];
      const v1=[a[0]-p[0],a[1]-p[1]], v2=[b[0]-p[0],b[1]-p[1]];
      const l1=Math.hypot(...v1), l2=Math.hypot(...v2);
      const u1=[v1[0]/l1,v1[1]/l1], u2=[v2[0]/l2,v2[1]/l2];
      const dot=u1[0]*u2[0]+u1[1]*u2[1];
      if (Math.abs(dot)<0.03) { const s=13; marks+=`<path d="M${p[0]+u1[0]*s},${p[1]+u1[1]*s} L${p[0]+u1[0]*s+u2[0]*s},${p[1]+u1[1]*s+u2[1]*s} L${p[0]+u2[0]*s},${p[1]+u2[1]*s}" fill="none" stroke="#ff5d73" stroke-width="2.5"/>`; }
      else { const r=16; const cross=u1[0]*u2[1]-u1[1]*u2[0]; marks+=`<path d="M${p[0]+u1[0]*r},${p[1]+u1[1]*r} A${r},${r} 0 0 ${cross>0?1:0} ${p[0]+u2[0]*r},${p[1]+u2[1]*r}" fill="none" stroke="#9b7bf0" stroke-width="2.5"/>`; }
    }
  }
  const d = o.path || ('M'+pts.map(p=>p.join(',')).join(' L')+' Z');
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><path d="${d}" fill="${o.fill||'#ffe1e6'}" stroke="#3a2c4a" stroke-width="4" stroke-linejoin="round"/>${marks}</svg>`;
}
const SHAPES = [
  {id:'tri', n:3, svg:()=>polySVG([[30,140],[170,140],[110,25]],{fill:'#ffe1e6'})},
  {id:'rect', n:4, svg:()=>polySVG([[25,30],[175,30],[175,130],[25,130]],{fill:'#dff1ff'})},
  {id:'pent', n:5, svg:()=>polySVG([[100,18],[180,75],[150,145],[50,145],[20,75]],{fill:'#eee6ff'})},
  {id:'hex', n:6, svg:()=>polySVG([[55,20],[145,20],[190,80],[145,140],[55,140],[10,80]],{fill:'#ffe7d6'})},
  {id:'fan', n:1, svg:()=>`<svg viewBox="0 0 200 160" width="200" height="160"><path d="M100,145 L35,40 Q100,0 165,40 Z" fill="#fff2c9" stroke="#3a2c4a" stroke-width="4" stroke-linejoin="round"/></svg>`},
  {id:'star4', n:0, svg:()=>`<svg viewBox="0 0 200 160" width="200" height="160"><path d="M100,10 Q110,70 180,80 Q110,90 100,150 Q90,90 20,80 Q90,70 100,10 Z" fill="#f3d6f5" stroke="#3a2c4a" stroke-width="4"/></svg>`},
  {id:'circle', n:0, svg:()=>`<svg viewBox="0 0 200 160" width="200" height="160"><circle cx="100" cy="80" r="62" fill="#d8f6ee" stroke="#3a2c4a" stroke-width="4"/></svg>`},
  {id:'semi', n:2, svg:()=>`<svg viewBox="0 0 200 160" width="200" height="160"><path d="M25,120 A75,75 0 0 1 175,120 Z" fill="#ffe1e6" stroke="#3a2c4a" stroke-width="4" stroke-linejoin="round"/></svg>`},
  {id:'trap', n:4, svg:()=>polySVG([[60,30],[140,30],[185,135],[15,135]],{fill:'#fff2c9'})},
  {id:'cone', n:1, svg:()=>`<svg viewBox="0 0 200 160" width="200" height="160"><path d="M100,15 L40,125 Q100,160 160,125 Z" fill="#dff1ff" stroke="#3a2c4a" stroke-width="4" stroke-linejoin="round"/></svg>`},
];
function clockSVG(h, m, size=150){
  const c=size/2, r=size/2-8;
  let ticks=''; for(let i=1;i<=12;i++){ const a=rad(i*30-90); ticks+=`<text x="${c+(r-16)*Math.cos(a)}" y="${c+(r-16)*Math.sin(a)+5}" font-size="${size/11}" text-anchor="middle" fill="#3a2c4a" font-weight="600">${i}</text>`; }
  const ha=rad((h%12)*30+m*0.5-90), ma=rad(m*6-90);
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><circle cx="${c}" cy="${c}" r="${r}" fill="#fff" stroke="#9b7bf0" stroke-width="7"/>${ticks}<line x1="${c}" y1="${c}" x2="${c+r*0.48*Math.cos(ha)}" y2="${c+r*0.48*Math.sin(ha)}" stroke="#ff5d73" stroke-width="6" stroke-linecap="round"/><line x1="${c}" y1="${c}" x2="${c+r*0.72*Math.cos(ma)}" y2="${c+r*0.72*Math.sin(ma)}" stroke="#3a2c4a" stroke-width="4" stroke-linecap="round"/><circle cx="${c}" cy="${c}" r="5" fill="#3a2c4a"/></svg>`;
}
function linesSVG(angle, gap, o={}) {
  // two lines; blue line horizontal, red line at 'angle' from it; gap>0 means they don't touch (perp check by extension)
  const w=o.w||200,h=o.h||150, cx=100, cy=100;
  const a=rad(-angle), L=70;
  const off = gap||0;
  const x0=cx + off, y0=cy - (off?14:0);
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><line x1="20" y1="${cy}" x2="180" y2="${cy}" stroke="#3a9be0" stroke-width="5" stroke-linecap="round"/><line x1="${x0 - (o.cross?L*Math.cos(a):0)}" y1="${y0 - (o.cross?L*Math.sin(a):0)}" x2="${x0+L*Math.cos(a)}" y2="${y0+L*Math.sin(a)}" stroke="#ff5d73" stroke-width="5" stroke-linecap="round"/></svg>`;
}
function rulerSVG(start, end, o={}) {
  // ruler 0..max cm, string from start to end
  const max=o.max||100, w=o.w||620, pad=20, sc=(w-2*pad)/max, h=110;
  let t=''; for(let i=0;i<=max;i++){ const x=pad+i*sc; const big=i%10===0, mid=i%5===0; t+=`<line x1="${x}" y1="60" x2="${x}" y2="${60+(big?22:mid?15:8)}" stroke="#3a2c4a" stroke-width="${big?2:1}"/>`; if(big) t+=`<text x="${x}" y="100" font-size="14" text-anchor="middle" fill="#3a2c4a" font-weight="600">${i}</text>`; }
  const sx=pad+start*sc, ex=pad+end*sc;
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="width:100%;height:auto"><rect x="${pad-12}" y="58" width="${w-2*pad+24}" height="48" rx="8" fill="#ffd25e" stroke="#efb52a" stroke-width="2"/>${t}<text x="${pad-4}" y="76" font-size="11" fill="#3a2c4a">cm</text><line x1="${sx}" y1="40" x2="${ex}" y2="40" stroke="#b5651d" stroke-width="10" stroke-linecap="round"/><line x1="${sx}" y1="40" x2="${ex}" y2="40" stroke="#d99058" stroke-width="4" stroke-dasharray="6 6"/><line x1="${sx}" y1="30" x2="${sx}" y2="60" stroke="#ff5d73" stroke-dasharray="3 3" stroke-width="2"/><line x1="${ex}" y1="30" x2="${ex}" y2="60" stroke="#ff5d73" stroke-dasharray="3 3" stroke-width="2"/></svg>`;
}

// ---------- icons for cards ----------
const ICON = {
  angle: angleSVG(45,{w:140,h:100,len:90,cx:25,cy:85}),
  compare: `<svg viewBox="0 0 160 100" width="160" height="100"><path d="M80 90 L20 30 A85 85 0 0 1 140 30 Z" fill="#ffd25e" stroke="#3a2c4a" stroke-width="4"/><path d="M80 90 L55 25 M80 90 L105 25" stroke="#efb52a" stroke-width="3"/></svg>`,
  right: angleSVG(90,{w:140,h:100,len:80,cx:35,cy:88}),
  perp: `<svg viewBox="0 0 140 100" width="140" height="100"><line x1="15" y1="80" x2="125" y2="80" stroke="#3a9be0" stroke-width="6" stroke-linecap="round"/><line x1="70" y1="80" x2="70" y2="10" stroke="#ff5d73" stroke-width="6" stroke-linecap="round"/><path d="M70 66 L84 66 L84 80" fill="none" stroke="#3a2c4a" stroke-width="3"/></svg>`,
  ao: `<svg viewBox="0 0 160 100" width="160" height="100"><g>${''}</g><line x1="10" y1="85" x2="70" y2="85" stroke="#3a2c4a" stroke-width="5" stroke-linecap="round"/><line x1="10" y1="85" x2="60" y2="40" stroke="#3a2c4a" stroke-width="5" stroke-linecap="round"/><line x1="100" y1="85" x2="155" y2="85" stroke="#3a2c4a" stroke-width="5" stroke-linecap="round"/><line x1="100" y1="85" x2="80" y2="25" stroke="#3a2c4a" stroke-width="5" stroke-linecap="round"/><path d="M28 85 A18 18 0 0 0 23 73" stroke="#ff5d73" stroke-width="4" fill="none"/><path d="M118 85 A18 18 0 0 0 94 68" stroke="#9b7bf0" stroke-width="4" fill="none"/></svg>`,
  metre: `<svg viewBox="0 0 160 100" width="160" height="100"><rect x="8" y="38" width="144" height="28" rx="5" fill="#ffd25e" stroke="#efb52a" stroke-width="3"/>${Array.from({length:11},(_,i)=>`<line x1="${14+i*13.2}" y1="38" x2="${14+i*13.2}" y2="${i%5?50:58}" stroke="#3a2c4a" stroke-width="2"/>`).join('')}<text x="80" y="90" text-anchor="middle" font-size="18" font-weight="700" fill="#3a2c4a">1 m = 100 cm</text></svg>`,
  record: `<svg viewBox="0 0 160 100" width="160" height="100"><rect x="10" y="20" width="110" height="22" rx="4" fill="#6cc4ff"/><rect x="120" y="20" width="30" height="22" rx="4" fill="#ff9f5a"/><rect x="10" y="50" width="140" height="22" rx="4" fill="#ff5d73"/><text x="65" y="36" font-size="13" fill="#fff" text-anchor="middle" font-weight="700">1 m</text><text x="135" y="36" font-size="11" fill="#fff" text-anchor="middle" font-weight="700">20</text><text x="80" y="66" font-size="13" fill="#fff" text-anchor="middle" font-weight="700">120 cm</text></svg>`,
  tools: `<svg viewBox="0 0 160 100" width="160" height="100"><circle cx="45" cy="60" r="30" fill="#fff" stroke="#3a9be0" stroke-width="5"/><path d="M45 60 L45 33 M45 60 L68 70 M45 60 L22 70" stroke="#ffd25e" stroke-width="4"/><path d="M60 35 L110 5" stroke="#3a9be0" stroke-width="7" stroke-linecap="round"/><circle cx="118" cy="68" r="24" fill="#3a9be0"/><circle cx="118" cy="68" r="9" fill="#5fd3b3"/><path d="M135 80 L155 95" stroke="#3a2c4a" stroke-width="3"/></svg>`,
  units: `<svg viewBox="0 0 160 100" width="160" height="100"><rect x="15" y="30" width="80" height="40" rx="8" fill="#ffd25e" stroke="#3a2c4a" stroke-width="3"/><rect x="25" y="38" width="20" height="14" fill="#6cc4ff"/><rect x="50" y="38" width="20" height="14" fill="#6cc4ff"/><circle cx="35" cy="74" r="7" fill="#3a2c4a"/><circle cx="78" cy="74" r="7" fill="#3a2c4a"/><rect x="110" y="25" width="34" height="56" rx="7" fill="#3a2c4a"/><rect x="114" y="31" width="26" height="42" rx="3" fill="#9b7bf0"/><text x="55" y="95" font-size="14" text-anchor="middle" font-weight="700" fill="#3a2c4a">m</text><text x="127" y="97" font-size="14" text-anchor="middle" font-weight="700" fill="#3a2c4a">cm</text></svg>`,
  body: `<svg viewBox="0 0 160 100" width="160" height="100"><circle cx="80" cy="25" r="13" fill="#ffd3c2" stroke="#3a2c4a" stroke-width="3"/><path d="M80 38 V75 M80 75 L68 95 M80 75 L92 95" stroke="#3a2c4a" stroke-width="4" stroke-linecap="round"/><path d="M20 50 H140" stroke="#ff5d73" stroke-width="5" stroke-linecap="round"/><path d="M20 40 V60 M140 40 V60" stroke="#9b7bf0" stroke-width="3"/></svg>`,
};
const HEART = c=>`<svg viewBox="0 0 100 100"><path d="M50 88 C10 60 5 30 28 18 C40 12 50 22 50 30 C50 22 60 12 72 18 C95 30 90 60 50 88Z" fill="${c}" stroke="#3a2c4a" stroke-width="4"/></svg>`;

// ---------- LESSONS ----------
const LESSONS = [
 {id:'l1', unit:3, ch:'7', zh:'認識角', en:'What is an angle?', icon:'angle', c:'c-red', game:'count',
  steps:[
   {say:'l1a', key:['兩條直線相交會形成角。','Two straight lines meeting form an angle.'], widget:'makeAngle'},
   {say:'l1b', key:['數角：彎線唔會形成角！','Counting: curved sides make no angle!'], widget:'shapeAngles'},
  ]},
 {id:'l2', unit:3, ch:'7', zh:'比較角的大小', en:'Comparing angles', icon:'compare', c:'c-yellow', game:'compare',
  steps:[
   {say:'l2a', key:['角嘅大小同直線長短無關！','Angle size has nothing to do with line length!'], widget:'fan'},
   {say:'l2b', key:['用透明紙印畫，疊放比較。','Trace and overlap to compare.'], widget:'overlap'},
  ]},
 {id:'l3', unit:3, ch:'7', zh:'認識直角', en:'Right angles', icon:'right', c:'c-sky', game:'sort',
  steps:[
   {say:'l3a', key:['直角符號：∟','Right angle mark: ∟'], widget:'rightThings'},
   {say:'l3b', key:['用直尺嘅直角對一對。','Check with the corner of a ruler.'], widget:'rulerCheck'},
  ]},
 {id:'l4', unit:3, ch:'8', zh:'垂直線', en:'Perpendicular lines', icon:'perp', c:'c-mint', game:'perp',
  steps:[
   {say:'l4a', key:['相交形成直角 → 互相垂直','Meet at a right angle → perpendicular'], widget:'perpRotate'},
   {say:'l4b', key:['未相交？延長佢再睇！','Not touching? Extend and check!'], widget:'extend'},
   {say:'l4c', key:['垂直嗰條係最短嘅距離！','The perpendicular line is the shortest distance!'], widget:'river'},
  ]},
 {id:'l5', unit:3, ch:'9', zh:'銳角和鈍角', en:'Acute and obtuse angles', icon:'ao', c:'c-purple', game:'sort',
  steps:[
   {say:'l5a', key:['銳角 < 直角','acute angle < right angle'], widget:'aoSlider'},
   {say:'l5b', key:['直角 < 鈍角 < 兩個直角','right angle < obtuse angle < two right angles'], widget:'aoSlider2'},
   {say:'l5c', key:['鐘面都有角！','Clocks have angles too!'], widget:'clock'},
  ]},
 {id:'l6', unit:4, ch:'10', zh:'認識米', en:'Knowing the metre', icon:'metre', c:'c-orange', game:'ruler',
  steps:[
   {say:'l6a', key:['1 米 (m) = 100 厘米 (cm)','1 metre (m) = 100 centimetres (cm)'], widget:'metreStick'},
   {say:'l6b', key:['米又叫「公尺」。1米 = 1公尺','Things about 1 m: door handle height, recycling bin'], widget:'aboutOne'},
  ]},
 {id:'l7', unit:4, ch:'10', zh:'記錄量度結果', en:'Recording measurements', icon:'record', c:'c-red', game:'convert',
  steps:[
   {say:'l7a', key:['1 米 20 厘米 = 120 厘米','1 m 20 cm = 120 cm'], widget:'convertBar'},
   {say:'l7b', key:['8 米 9 厘米 = 809 厘米（記得個 0！）','8 m 9 cm = 809 cm (remember the 0!)'], widget:'zeroTrap'},
   {say:'l7c', key:['唔係由 0 開始：尾 − 頭','Not from 0: end − start'], widget:'rulerRead'},
  ]},
 {id:'l8', unit:4, ch:'11', zh:'量度工具', en:'Measuring tools', icon:'tools', c:'c-sky', game:'tool',
  steps:[
   {say:'l8a', key:['揀最合適嘅工具！','Choose the most suitable tool!'], widget:'toolTable'},
   {say:'l8b', key:['滾輪「嗒」一聲 = 1 米','Trundle wheel: 1 click = 1 m'], widget:'wheel'},
  ]},
 {id:'l9', unit:4, ch:'11', zh:'長度單位', en:'Units of length', icon:'units', c:'c-yellow', game:'unit',
  steps:[ {say:'l9a', key:['長嘅用米 (m)，短嘅用厘米 (cm)','Long → m, short → cm'], widget:'unitSort'} ]},
 {id:'l10', unit:4, ch:'11', zh:'永備尺', en:'Body rulers', icon:'body', c:'c-mint', game:'unit',
  steps:[ {say:'l10a', key:['指距 ≈ 15 cm　臂距 ≈ 1 m　肩膊至地面 ≈ 1 m','Hand span ≈ 15 cm　Arm span ≈ 1 m　Shoulder height ≈ 1 m'], widget:'bodyRuler'} ]},
];

// ---------- GAMES (question generators) ----------
const OBJ = {
 // [zh, en, unit, toolAnswer, value]
 items:[
  ['校巴的長度','length of a school bus','m'],['獅子山的高度','height of Lion Rock','m'],['學生證的闊度','width of a student card','cm'],
  ['手提電話的長度','length of a mobile phone','cm'],['課室門的高度','height of a classroom door','m'],['鉛筆的長度','length of a pencil','cm'],
  ['游泳池的長度','length of a swimming pool','m'],['膠擦的長度','length of an eraser','cm'],['黑板的長度','length of a blackboard','m'],
  ['牙刷的長度','length of a toothbrush','cm'],['課本的闊度','width of a textbook','cm'],['環球貿易廣場的高度','height of the ICC tower','m'],
  ['卵石徑的長度','length of a pebble path','m'],['水樽的高度','height of a water bottle','cm'],['床的長度約 2','length of a bed, about 2','m'],
  ['書桌的高度約 70','height of a desk, about 70','cm'],['門的高度約 2','height of a door, about 2','m'],['一輛校巴長約 7','a school bus is about 7','m'],
 ],
 tools:[
  ['筆袋的長度','length of a pencil case','ruler'],['杯的高度','height of a cup','ruler'],['腰圍','waist','soft'],['袖長','sleeve length','soft'],
  ['掃帚的長度','length of a broom','mstick'],['乒乓球桌的闊度','width of a ping-pong table','mstick'],['跳遠的距離','long jump distance','tape'],
  ['床的長度','length of a bed','tape'],['泳池的長度','length of a swimming pool','wheel'],['彎彎的小徑','a curvy path','wheel'],
  ['圍繞噴水池一圈','around a fountain','wheel'],['籃球場三分線','basketball 3-point line','wheel'],['牙刷的長度','length of a toothbrush','ruler'],['頭圍','around your head','soft'],
 ],
};
const TOOLN = {ruler:['厘米尺','cm ruler'],soft:['軟尺','soft tape'],mstick:['米尺','metre stick'],tape:['捲尺','measuring tape'],wheel:['滾輪','trundle wheel']};
const TOOLSVG = {
 ruler:`<svg viewBox="0 0 100 60"><rect x="5" y="20" width="90" height="20" rx="3" fill="#ffd3ec" stroke="#3a2c4a" stroke-width="2.5"/>${Array.from({length:9},(_,i)=>`<line x1="${14+i*9.5}" y1="20" x2="${14+i*9.5}" y2="${i%2?27:32}" stroke="#3a2c4a" stroke-width="1.5"/>`).join('')}</svg>`,
 soft:`<svg viewBox="0 0 100 60"><ellipse cx="38" cy="30" rx="26" ry="22" fill="#5fd3b3" stroke="#3a2c4a" stroke-width="2.5"/><ellipse cx="38" cy="26" rx="18" ry="12" fill="#a7eedb"/><path d="M60 38 Q80 45 95 30" stroke="#fff2c9" stroke-width="7" fill="none"/><path d="M60 38 Q80 45 95 30" stroke="#3a2c4a" stroke-width="1" fill="none"/></svg>`,
 mstick:`<svg viewBox="0 0 100 60"><rect x="2" y="24" width="96" height="12" fill="#efb52a" stroke="#3a2c4a" stroke-width="2" transform="rotate(-20 50 30)"/></svg>`,
 tape:`<svg viewBox="0 0 100 60"><circle cx="55" cy="32" r="22" fill="#3a9be0" stroke="#3a2c4a" stroke-width="2.5"/><circle cx="55" cy="32" r="9" fill="#5fd3b3"/><path d="M33 32 L8 15" stroke="#3a2c4a" stroke-width="2.5"/><circle cx="8" cy="15" r="3" fill="#3a2c4a"/></svg>`,
 wheel:`<svg viewBox="0 0 100 60"><circle cx="35" cy="38" r="19" fill="#fff" stroke="#3a9be0" stroke-width="4"/><path d="M35 38 L35 21 M35 38 L50 46 M35 38 L20 46" stroke="#ffd25e" stroke-width="3"/><path d="M45 25 L85 4" stroke="#3a9be0" stroke-width="6" stroke-linecap="round"/></svg>`,
};
function kindOf(d){ return d<90?'acute':d===90?'right':'obtuse'; }
const KN = {acute:['銳角','acute'], right:['直角','right'], obtuse:['鈍角','obtuse']};

const GAMES = {
 sort:{zh:'角角分類',en:'Angle Sorter',icon:'ao',c:'c-purple',intro:'g_sort',n:8, gen(){
   const k=pick(['acute','right','obtuse']); const d = k==='acute'?rnd(20,75):k==='right'?90:rnd(105,165);
   const rot = pick([0,0,15,30,-20,60,110,200,250]);
   return {q:L2('呢個係咩角？','What kind of angle is this?'), art:fitAngle(d,rot,{w:240,h:170,len:110,len2:rnd(70,110)}), opts:['acute','right','obtuse'].map(x=>({id:x,label:L2(KN[x][0],KN[x][1]+' angle'),sub:L2(KN[x][1],KN[x][0])})), ans:k,
     hint:L2('細過直角係銳角；大過直角係鈍角；同直尺角一樣係直角。','Smaller than a right angle is acute; bigger is obtuse.')};
 }},
 compare:{zh:'邊個角最大？',en:'Biggest Angle',icon:'compare',c:'c-yellow',intro:'g_cmp',n:8, gen(){
   const big = Math.random()<.5; const ds = shuffle([rnd(25,50),rnd(60,85),90,rnd(100,125),rnd(135,160)]).slice(0,3);
   const lens = shuffle([60,85,110]); // trick: long lines on small angles
   const sorted=[...ds].sort((a,b)=>a-b); const target = big?sorted[2]:sorted[0];
   if (Math.random()<.6){ const iMin=ds.indexOf(sorted[0]); lens[iMin]=115; lens[ds.indexOf(sorted[2])]=55; }
   const letters=shuffle(['a','b','c','d','e','f','m','n','p','x','y','z']).slice(0,3);
   return {q:L2(big?'邊個角最大？':'邊個角最細？', big?'Which angle is the LARGEST?':'Which angle is the SMALLEST?'), sub:L2('小心！唔好睇條線有幾長。','Careful! Line length does not matter.'),
     opts:ds.map((d,i)=>({id:String(d),label:L2('角 ','angle ')+letters[i],svg:fitAngle(d,pick([0,10,20]),{w:180,h:140,len:lens[i],label:letters[i]})})), ans:String(target),
     hint:L2('角嘅大小睇張開得幾闊。','Look at how wide the angle opens.')};
 }},
 count:{zh:'數角角',en:'Count the Angles',icon:'angle',c:'c-red',intro:'g_count',n:8, gen(){
   const s=pick(SHAPES.filter(x=>x.id!=='star4')); const opts=shuffle([...new Set([s.n, Math.max(0,s.n-1), s.n+1, s.n+2])]).slice(0,4);
   if(!opts.includes(s.n)) opts[0]=s.n;
   return {q:L2('呢個圖形有幾多個角？','How many angles does this shape have?'), art:s.svg(), opts:shuffle(opts).map(n=>({id:String(n),label:String(n)})), ans:String(s.n),
     hint:L2('兩條直線相交先有角；彎線唔計！','Only two straight lines meeting make an angle; curves don\'t count!')};
 }},
 perp:{zh:'垂直偵探',en:'Perpendicular Detective',icon:'perp',c:'c-mint',intro:'g_pd',n:8, gen(){
   const yes=Math.random()<.5; const ang = yes?90:pick([60,70,75,110,120,135]); const gap=Math.random()<.35; const cross=!gap&&Math.random()<.5;
   const rot=pick([0,0,25,-30,45]);
   const svg=linesSVG(ang, gap?30:0,{cross}).replace('<svg ',`<svg style="transform:rotate(${rot}deg)" `);
   return {q:L2('呢兩條直線係唔係互相垂直？','Are these two lines perpendicular?'), art:svg, opts:[{id:'y',label:'✓',sub:L2('互相垂直','perpendicular')},{id:'n',label:'✗',sub:L2('唔係垂直','not perpendicular')}], ans:yes?'y':'n',
     hint:L2('相交形成直角先係互相垂直。未相交可以延長嚟睇。','They must form a right angle. Extend the lines if they don\'t touch.')};
 }},
 clock:{zh:'鐘面角',en:'Clock Angles',icon:'ao',c:'c-sky',intro:'g_clock',n:6, gen(){
   const c=pick([[3,0,'right'],[9,0,'right'],[6,15,'obtuse'],[12,10,'acute'],[1,0,'acute'],[2,0,'acute'],[4,0,'obtuse'],[5,0,'obtuse'],[10,0,'obtuse'],[11,0,'acute'],[8,0,'obtuse'],[3,0,'right']]);
   return {q:L2('時針同分針形成咩角？','What angle do the hands make?'), sub:`${c[0]}:${String(c[1]).padStart(2,'0')}`, art:clockSVG(c[0],c[1],170), opts:['acute','right','obtuse'].map(x=>({id:x,label:L2(KN[x][0],KN[x][1]),sub:L2(KN[x][1],KN[x][0])})), ans:c[2],
     hint:L2('3 點同 9 點係直角。','3 o\'clock and 9 o\'clock make right angles.')};
 }},
 ruler:{zh:'尺子讀數',en:'Ruler Reader',icon:'metre',c:'c-orange',intro:'g_ruler',n:6, gen(){
   const s=pick([0,0,10,20,30,40]); const e=s+rnd(3,9)*10 - (Math.random()<.3?5:0); const len=Math.min(e,100)-s;
   const opts=shuffle([...new Set([len, Math.min(e,100), len+10, Math.abs(len-10)||15])]).slice(0,4); if(!opts.includes(len)) opts[0]=len;
   return {q:L2('條繩有幾長？','How long is the string?'), art:rulerSVG(s,Math.min(e,100)), opts:shuffle(opts).map(n=>({id:String(n),label:n+' cm'})), ans:String(len),
     hint:L2(`由 ${s} 開始，去到 ${Math.min(e,100)}，所以 ${Math.min(e,100)} − ${s}。`,`Starts at ${s}, ends at ${Math.min(e,100)}: ${Math.min(e,100)} − ${s}.`)};
 }},
 convert:{zh:'米變厘米',en:'Metre Magic',icon:'record',c:'c-red',intro:'g_conv',n:8, gen(){
   const m=rnd(1,9); const cm=pick([0,rnd(1,9),rnd(10,95)]); const ans=m*100+cm;
   const zh = cm? `${m} 米 ${cm} 厘米 = ? 厘米` : `${m} 米 = ? 厘米`; const en = cm? `${m} m ${cm} cm = ? cm` : `${m} m = ? cm`;
   const wrong=[ Number(`${m}${cm}`), m*10+cm, m*100+cm*10, ans+100].filter(x=>x!==ans);
   const opts=shuffle([ans,...shuffle([...new Set(wrong)]).slice(0,3)]);
   return {q:L2(zh,en), opts:opts.map(n=>({id:String(n),label:L2(n+' 厘米',n+' cm')})), ans:String(ans),
     hint:L2(`${m} 米 = ${m*100} 厘米，再加 ${cm}。${cm<10&&cm>0?'記得中間要寫 0！':''}`,`${m} m = ${m*100} cm, then add ${cm}.${cm<10&&cm>0?' Remember the 0!':''}`)};
 }},
 unit:{zh:'米定厘米？',en:'Metre or Centimetre?',icon:'units',c:'c-yellow',intro:'g_unit',n:8, gen(){
   const it=pick(OBJ.items);
   return {q:L2(it[0]+' ___',`The ${it[1]} ___`), sub:L2('揀合適嘅長度單位','Choose the right unit'), opts:[{id:'m',label:L2('米 (m)','metres (m)')},{id:'cm',label:L2('厘米 (cm)','centimetres (cm)')}], ans:it[2],
     hint:L2('好長嘅嘢用米；短嘅嘢用厘米。','Long things → m; short things → cm.')};
 }},
 tool:{zh:'工具小專家',en:'Tool Expert',icon:'tools',c:'c-sky',intro:'g_tool',n:8, gen(){
   const it=pick(OBJ.tools); const ids=shuffle(['ruler','soft','mstick','tape','wheel'].filter(x=>x!==it[2])).slice(0,2).concat(it[2]);
   return {q:L2('量度「'+it[0]+'」最適合用？','Best tool to measure the '+it[1]+'?'), opts:shuffle(ids).map(x=>({id:x,label:L2(TOOLN[x][0],TOOLN[x][1]),svg:TOOLSVG[x]})), ans:it[2],
     hint:L2('短：厘米尺；身體：軟尺；長：米尺／捲尺；彎彎曲曲好長：滾輪。','Short: ruler; body: soft tape; long: metre stick / tape; long and curvy: wheel.')};
 }},
};
// special interactive games
const SPECIAL = {
 memory:{zh:'記憶翻翻樂',en:'Memory Flip',icon:'compare',c:'c-purple'},
 maker:{zh:'整角大師',en:'Angle Maker',icon:'angle',c:'c-red'},
 perpmaker:{zh:'垂直轉轉樂',en:'Spin to Perpendicular',icon:'perp',c:'c-mint'},
};
const STICKER_LIST = [
 ['sort','#ff5d73'],['compare','#ffd25e'],['count','#ff9f5a'],['perp','#5fd3b3'],['clock','#6cc4ff'],['ruler','#ffb3c7'],['convert','#9b7bf0'],['unit','#ffd25e'],['tool','#3a9be0'],['memory','#c39bff'],['maker','#ff5d73'],['perpmaker','#5fd3b3'],['quiz','#ffd25e']
];
const STICKER_ART = {
 sort:'susu_face', compare:'neko_face', count:'susu_face', perp:'neko_face', clock:'susu_face', ruler:'neko_face', convert:'susu_face', unit:'neko_face', tool:'susu_face', memory:'neko_face', maker:'susu_face', perpmaker:'neko_face', quiz:'both'
};

// ---------- router ----------
function go(view, arg){ location.hash = arg ? `${view}/${arg}` : view; }
function route(){
  clearTimeout(bubbleTimer); $('#bubble').classList.add('hide');
  const [v,a] = (location.hash.slice(1)||'home').split('/');
  $$('.tabs button').forEach(b=>b.classList.toggle('on', b.dataset.go===v || (v==='lesson'&&b.dataset.go==='learn') || (v==='game'&&b.dataset.go==='games')));
  const m=$('#view'); m.classList.remove('view-enter'); void m.offsetWidth; m.classList.add('view-enter');
  window.scrollTo({top:0});
  ({home:viewHome, learn:viewLearn, lesson:viewLesson, games:viewGames, game:viewGame, quiz:viewQuiz, stickers:viewStickers}[v]||viewHome)(a);
}
function i18n(){ $$('[data-i18n]').forEach(e=>e.innerHTML=T(e.dataset.i18n)); $('#langBtn').textContent = lang==='zh'?'EN':'中'; document.documentElement.lang = lang==='zh'?'zh-Hant-HK':'en'; }

function lessonCard(l){
  const d=done['lesson_'+l.id];
  return `<button class="card ${l.c}" data-lesson="${l.id}">${d?`<span class="badge">${STAR}</span>`:''}<div class="ico">${ICON[l.icon]}</div><span class="chip">${L2('第 '+l.ch+' 課','Ch '+l.ch)}</span><h3>${L2(l.zh,l.en)}</h3><span class="en">${L2(l.en,l.zh)}</span></button>`;
}
function gameCard(id,g){
  const s=stickers[id];
  return `<button class="card ${g.c}" data-game="${id}">${s?`<span class="badge">${STAR}</span>`:''}<div class="ico">${ICON[g.icon]}</div><h3>${L2(g.zh,g.en)}</h3><span class="en">${L2(g.en,g.zh)}</span></button>`;
}
function bindCards(root){
  $$('[data-lesson]',root).forEach(b=>b.onclick=()=>go('lesson',b.dataset.lesson));
  $$('[data-game]',root).forEach(b=>b.onclick=()=>go('game',b.dataset.game));
}

// ---------- views ----------
function viewHome(){
  const m=$('#view');
  m.innerHTML = `
  <section class="hero">
    <div><h1>${T('hero_t')}</h1><p>${T('hero_p')}</p>
      <div class="hero-btns"><button class="btn big red" data-go2="learn">${T('go_learn')}</button><button class="btn big purple" data-go2="games">${T('go_games')}</button><button class="btn big yellow" data-go2="quiz">${T('go_quiz')}</button></div></div>
    <div class="dolls"><img src="img/susu.webp" alt="Susu" id="hS"><img src="img/neko.webp" alt="Neko" id="hN"></div>
  </section>
  <h2 class="section-title">${T('u3')}</h2><div class="grid">${LESSONS.filter(l=>l.unit===3).map(lessonCard).join('')}</div>
  <h2 class="section-title">${T('u4')}</h2><div class="grid">${LESSONS.filter(l=>l.unit===4).map(lessonCard).join('')}</div>
  <h2 class="section-title">${T('vocab')}</h2>
  <div class="vocab">${Object.entries(VOCAB).map(([k,v])=>`<button class="vcard" data-v="${k}"><div class="in"><div class="f">${lang==='zh'?v.zh:v.en}</div><div class="b">${lang==='zh'?v.en:v.zh}</div></div></button>`).join('')}</div>
  <div class="row" style="margin-top:26px"><button class="btn" id="resetBtn">${T('reset')}</button></div>`;
  $$('[data-go2]',m).forEach(b=>b.onclick=()=>go(b.dataset.go2));
  $('#hS').onclick=()=>speak('hello',{mood:'good'}); $('#hN').onclick=()=>speak('hello2',{mood:'good'});
  $$('.vcard',m).forEach((c,i)=>c.onclick=()=>{ c.classList.toggle('flip'); blip('flip'); speak('v_'+c.dataset.v,{who:i%2?'n':'s'}); });
  $('#resetBtn').onclick=()=>{ if(confirm(L2('確定要重設所有星星同貼紙？','Reset all stars and stickers?'))){ stars=0; stickers={}; done={}; store.set('stars',0); store.set('stickers',{}); store.set('done',{}); $('#starNum').textContent=0; route(); } };
  bindCards(m);
}
function viewLearn(){
  const m=$('#view');
  m.innerHTML=`<h2 class="section-title">${T('lessons_t')}</h2>
  <h2 class="section-title" style="font-size:24px;margin-top:10px"><span class="pill">${L2('單元三','Unit 3')}</span>${L2('角和垂直線','Angles and Perpendicular Lines')}</h2><div class="grid">${LESSONS.filter(l=>l.unit===3).map(lessonCard).join('')}</div>
  <h2 class="section-title" style="font-size:24px"><span class="pill">${L2('單元四','Unit 4')}</span>${L2('米','Metre')}</h2><div class="grid">${LESSONS.filter(l=>l.unit===4).map(lessonCard).join('')}</div>`;
  bindCards(m); speak('pick');
}
function viewGames(){
  const m=$('#view');
  m.innerHTML=`<h2 class="section-title">${T('games_t')}</h2>
   <div class="grid">${Object.entries(SPECIAL).map(([k,g])=>gameCard(k,g)).join('')}${Object.entries(GAMES).map(([k,g])=>gameCard(k,g)).join('')}</div>`;
  bindCards(m); speak('hello2');
}

// ---------- lesson view ----------
function viewLesson(id){
  const idx=LESSONS.findIndex(l=>l.id===id); const l=LESSONS[idx]; if(!l) return go('learn');
  const m=$('#view');
  m.innerHTML=`<button class="back" id="bk">← ${T('back')}</button>
   <div class="lesson-head"><span class="num">${L2('第 '+l.ch+' 課','Ch '+l.ch)}</span><h2>${L2(l.zh,l.en)}</h2><span class="en">${L2(l.en,l.zh)}</span></div>
   ${l.steps.map((s,i)=>{ const ln=LINES[s.say]; return `<section class="step"><div><div class="say ${ln.sp}"><img src="img/${ln.sp==='n'?'neko':'susu'}_face.webp" alt="" data-say="${s.say}"><div class="txt">${ln[lang]} <button class="play" data-say="${s.say}" aria-label="play">${SPK}</button></div></div><div class="keybox">${L2(s.key[0],s.key[1])}<small>${L2(s.key[1],s.key[0])}</small></div></div><div class="widget" id="w${i}"></div></section>`; }).join('')}
   <div class="lesson-nav">${idx>0?`<button class="btn" id="pv">← ${T('prev')}</button>`:'<span></span>'}<button class="btn mint" id="pg">${T('play_game')}</button>${idx<LESSONS.length-1?`<button class="btn purple" id="nx">${T('nextl')} →</button>`:'<span></span>'}</div>`;
  $('#bk').onclick=()=>go('learn');
  if($('#pv')) $('#pv').onclick=()=>go('lesson',LESSONS[idx-1].id);
  if($('#nx')) $('#nx').onclick=()=>go('lesson',LESSONS[idx+1].id);
  $('#pg').onclick=()=>go('game',l.game);
  $$('[data-say]',m).forEach(b=>b.onclick=()=>speak(b.dataset.say));
  l.steps.forEach((s,i)=>WIDGETS[s.widget]($('#w'+i)));
  if(!done['lesson_'+id]){ done['lesson_'+id]=1; store.set('done',done); addStar(1); }
  speak(l.steps[0].say);
}

// draggable angle widget
function angleMaker(el, o={}){
  const W=320,H=230, cx=o.cx||70, cy=o.cy||190, R=150;
  el.innerHTML += `<svg class="maker-svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="width:100%;max-width:${W}px;height:auto"><path class="arc"/><path class="sq" fill="none" stroke="#ff5d73" stroke-width="3"/><line x1="${cx}" y1="${cy}" x2="${cx+R+60}" y2="${cy}" stroke="#3a2c4a" stroke-width="6" stroke-linecap="round"/><line class="arm" x1="${cx}" y1="${cy}" stroke="#3a2c4a" stroke-width="6" stroke-linecap="round"/><circle class="handle" r="16" fill="#ff5d73" stroke="#fff" stroke-width="4"/><circle cx="${cx}" cy="${cy}" r="6" fill="#3a2c4a"/></svg>`;
  const svg=el.querySelector('svg:last-of-type'); let deg=o.start||50;
  function draw(){
    const a=rad(-deg), x=cx+R*Math.cos(a), y=cy+R*Math.sin(a);
    svg.querySelector('.arm').setAttribute('x2',x); svg.querySelector('.arm').setAttribute('y2',y);
    const h=svg.querySelector('.handle'); h.setAttribute('cx',x); h.setAttribute('cy',y);
    const r=36; const k=kindOf(Math.round(deg));
    if(Math.round(deg)===90){ svg.querySelector('.arc').setAttribute('d',''); svg.querySelector('.sq').setAttribute('d',`M${cx+22},${cy} L${cx+22},${cy-22} L${cx},${cy-22}`); }
    else { svg.querySelector('.sq').setAttribute('d',''); svg.querySelector('.arc').setAttribute('d',`M${cx},${cy} L${cx+r},${cy} A${r},${r} 0 0 0 ${cx+r*Math.cos(a)},${cy+r*Math.sin(a)} Z`); svg.querySelector('.arc').setAttribute('fill', k==='acute'?'rgba(255,93,115,.35)':'rgba(155,123,240,.4)'); }
    o.onChange && o.onChange(Math.round(deg), k);
  }
  let drag=false;
  const pos=e=>{ const p=svg.createSVGPoint(); const t=e.touches?e.touches[0]:e; p.x=t.clientX; p.y=t.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
  const move=e=>{ if(!drag) return; e.preventDefault(); const p=pos(e); let d=Math.atan2(cy-p.y, p.x-cx)*180/Math.PI; if(d<0) d = d<-90?179:5; d=Math.max(5,Math.min(179,d)); if(Math.abs(d-90)<4) d=90; deg=d; draw(); };
  svg.addEventListener('pointerdown',e=>{drag=true; svg.setPointerCapture(e.pointerId); move(e);});
  svg.addEventListener('pointermove',move); svg.addEventListener('pointerup',()=>{drag=false; o.onEnd&&o.onEnd(Math.round(deg),kindOf(Math.round(deg)));});
  draw();
  return { set(d){deg=d;draw();}, get:()=>Math.round(deg) };
}

const WIDGETS = {
 makeAngle(el){ el.innerHTML=`<div class="label" id="lbA"></div>`; angleMaker(el,{start:40,onChange:(d,k)=>{$('#lbA',el).textContent = L2('拉紅點！ 呢個係一個角','Drag the red dot! This is an angle');}}); },
 shapeAngles(el){
  const list=[SHAPES[0],SHAPES[1],SHAPES[4],SHAPES[5],SHAPES[2],SHAPES[7]]; let i=0;
  el.innerHTML=`<div id="sa"></div><div class="label" id="sal"></div><div class="row"><button class="btn" id="sap">←</button><button class="btn yellow" id="sas">${L2('顯示答案','Show answer')}</button><button class="btn" id="san">→</button></div>`;
  const show=(rev)=>{ const s=list[i]; $('#sa',el).innerHTML=s.svg(); $('#sal',el).textContent = rev? L2(`${s.n} 個角`,`${s.n} angle${s.n===1?'':'s'}`) : L2('有幾多個角？','How many angles?'); };
  $('#sap',el).onclick=()=>{i=(i+list.length-1)%list.length;show();}; $('#san',el).onclick=()=>{i=(i+1)%list.length;show();}; $('#sas',el).onclick=()=>{show(true);blip('good');};
  show();
 },
 fan(el){
  el.innerHTML=`<svg viewBox="0 0 300 190" width="300" height="190" id="fanS" style="width:100%;max-width:300px;height:auto"></svg><input type="range" min="10" max="170" value="40" aria-label="open fan"><div class="label" id="fl"></div>`;
  const s=$('#fanS',el), r=$('input',el);
  const draw=()=>{ const d=+r.value; let p=''; const n=9; for(let k=0;k<n;k++){ const a1=rad(-(90-d/2+d*k/n)), a2=rad(-(90-d/2+d*(k+1)/n)); p+=`<path d="M150,180 L${150+150*Math.cos(a1)},${180+150*Math.sin(a1)} L${150+150*Math.cos(a2)},${180+150*Math.sin(a2)} Z" fill="${k%2?'#ffd25e':'#fff2c9'}" stroke="#efb52a" stroke-width="1.5"/>`; }
   const a1=rad(-(90-d/2)), a2=rad(-(90+d/2));
   s.innerHTML=p+`<path d="M150,180 L${150+30*Math.cos(a1)},${180+30*Math.sin(a1)} A30,30 0 0 0 ${150+30*Math.cos(a2)},${180+30*Math.sin(a2)} Z" fill="#6cc4ff"/>`;
   $('#fl',el).textContent = L2('打開扇子：角愈嚟愈大！','Open the fan: the angle gets bigger!'); };
  r.oninput=draw; draw();
 },
 overlap(el){
  el.innerHTML=`<svg viewBox="0 0 300 170" width="300" height="170" style="width:100%;max-width:300px;height:auto"><g>${''}</g><line x1="150" y1="150" x2="290" y2="150" stroke="#3a2c4a" stroke-width="5"/><line x1="150" y1="150" x2="${150+90*Math.cos(rad(-55))}" y2="${150+90*Math.sin(rad(-55))}" stroke="#3a2c4a" stroke-width="5"/><text x="180" y="138" font-weight="700" font-size="20">n</text><g id="tr" style="transition:transform .9s ease"><line x1="10" y1="150" x2="140" y2="150" stroke="#ff5d73" stroke-width="4" stroke-dasharray="7 5"/><line x1="10" y1="150" x2="${10+130*Math.cos(rad(-40))}" y2="${150+130*Math.sin(rad(-40))}" stroke="#ff5d73" stroke-width="4" stroke-dasharray="7 5"/><text x="45" y="140" fill="#ff5d73" font-weight="700" font-size="20">m</text></g></svg><button class="btn sky" id="ov">${L2('疊放上去！','Overlap!')}</button><div class="label" id="ovl"></div>`;
  let on=false; $('#ov',el).onclick=()=>{ on=!on; $('#tr',el).style.transform= on?'translateX(140px)':'none'; $('#ovl',el).textContent= on? L2('角 m 比角 n 細！','Angle m is smaller than angle n!'):''; if(on) blip('good'); };
 },
 rightThings(el){
  el.innerHTML=`<svg viewBox="0 0 300 180" width="300" height="180" style="width:100%;max-width:300px;height:auto"><rect x="20" y="20" width="110" height="140" rx="4" fill="#ff8fb1" stroke="#3a2c4a" stroke-width="3"/><text x="75" y="80" text-anchor="middle" font-size="18" font-weight="700" fill="#fff">${L2('數學','MATHS')}</text><rect x="170" y="40" width="110" height="80" fill="#3a9be0" stroke="#3a2c4a" stroke-width="3"/><rect x="215" y="120" width="20" height="25" fill="#3a2c4a"/>${[[20,20,1,1],[130,20,-1,1],[20,160,1,-1],[130,160,-1,-1],[170,40,1,1],[280,40,-1,1],[170,120,1,-1],[280,120,-1,-1]].map(([x,y,dx,dy])=>`<path class="rc" d="M${x+dx*14},${y} L${x+dx*14},${y+dy*14} L${x},${y+dy*14}" fill="none" stroke="#ffd25e" stroke-width="4" opacity="0"/>`).join('')}</svg><button class="btn yellow" id="rt">${L2('搵直角！','Find the right angles!')}</button>`;
  $('#rt',el).onclick=()=>{ $$('.rc',el).forEach((p,i)=>setTimeout(()=>{p.setAttribute('opacity',1);blip('flip');},i*180)); };
 },
 rulerCheck(el){
  const angs=[[70,'p'],[90,'q'],[110,'r']]; let i=0;
  el.innerHTML=`<div id="rc"></div><div class="label" id="rcl"></div><div class="row"><button class="btn" id="rcn">${L2('下一個角','Next angle')}</button><button class="btn sky" id="rcc">${L2('用直尺對一對','Check with ruler')}</button></div>`;
  const draw=(chk)=>{ const [d,l]=angs[i]; const k=kindOf(d);
   $('#rc',el).innerHTML=`<svg viewBox="0 0 240 170" width="240" height="170">${chk?'<rect x="60" y="20" width="30" height="130" fill="rgba(108,196,255,.6)" stroke="#3a9be0"/>':''}<line x1="60" y1="150" x2="220" y2="150" stroke="#3a2c4a" stroke-width="5"/><line x1="60" y1="150" x2="${60+130*Math.cos(rad(-d))}" y2="${150+130*Math.sin(rad(-d))}" stroke="#3a2c4a" stroke-width="5"/><text x="80" y="135" font-size="20" font-weight="700">${l}</text></svg>`;
   $('#rcl',el).textContent = chk? (k==='right'? L2(`角 ${l} 同直角一樣大，係直角！`,`Angle ${l} is a right angle!`) : k==='acute'? L2(`角 ${l} 比直角細，唔係直角。`,`Angle ${l} is smaller than a right angle.`) : L2(`角 ${l} 比直角大，唔係直角。`,`Angle ${l} is bigger than a right angle.`)) : ''; };
  $('#rcn',el).onclick=()=>{i=(i+1)%3;draw();}; $('#rcc',el).onclick=()=>{draw(true);blip('good');}; draw();
 },
 perpRotate(el){
  el.innerHTML=`<svg viewBox="0 0 260 200" width="260" height="200" id="pr" style="width:100%;max-width:260px;height:auto"></svg><input type="range" min="20" max="160" value="60" aria-label="rotate"><div class="label" id="prl"></div>`;
  const s=$('#pr',el), r=$('input',el);
  const draw=()=>{ let d=+r.value; if(Math.abs(d-90)<4) d=90; const a=rad(-d);
   s.innerHTML=`<line x1="20" y1="150" x2="240" y2="150" stroke="#3a9be0" stroke-width="6" stroke-linecap="round"/><line x1="${130-60*Math.cos(a)}" y1="${150-60*Math.sin(a)*-1*-1 + 0}" x2="${130+130*Math.cos(a)}" y2="${150+130*Math.sin(a)}" stroke="#ff5d73" stroke-width="6" stroke-linecap="round"/>${d===90?'<path d="M130,132 L148,132 L148,150" fill="none" stroke="#3a2c4a" stroke-width="3"/>':''}`;
   $('#prl',el).textContent = d===90? L2('互相垂直！✓','Perpendicular! ✓') : L2('未垂直，再轉吓！','Not yet, keep turning!');
   $('#prl',el).style.color = d===90?'var(--mint-d)':'';
  };
  r.oninput=()=>{draw(); if(Math.abs(+r.value-90)<4) blip('good');}; draw();
 },
 extend(el){
  el.innerHTML=`<svg viewBox="0 0 260 180" width="260" height="180" style="width:100%;max-width:260px;height:auto"><line x1="20" y1="150" x2="200" y2="150" stroke="#3a9be0" stroke-width="6" stroke-linecap="round"/><line x1="230" y1="20" x2="230" y2="110" stroke="#ff5d73" stroke-width="6" stroke-linecap="round"/><line id="ex1" x1="200" y1="150" x2="200" y2="150" stroke="#3a9be0" stroke-width="4" stroke-dasharray="6 5" style="transition:all .8s"/><line id="ex2" x1="230" y1="110" x2="230" y2="110" stroke="#ff5d73" stroke-width="4" stroke-dasharray="6 5" style="transition:all .8s"/><path id="exm" d="M212,150 L212,138 L230,138" fill="none" stroke="#3a2c4a" stroke-width="3" opacity="0"/></svg><button class="btn sky" id="exb">${L2('延長直線','Extend the lines')}</button><div class="label" id="exl"></div>`;
  $('#exb',el).onclick=()=>{ $('#ex1',el).setAttribute('x2',245); $('#ex2',el).setAttribute('y2',165); setTimeout(()=>{ $('#exm',el).setAttribute('d','M218,150 L218,138 L230,138'); $('#exm',el).setAttribute('opacity',1); $('#exl',el).textContent=L2('形成直角，互相垂直！','A right angle: perpendicular!'); blip('good'); },800); };
 },
 river(el){
  el.innerHTML=`<svg viewBox="0 0 300 190" width="300" height="190" style="width:100%;max-width:300px;height:auto"><rect x="0" y="40" width="300" height="110" fill="#bfe6ff"/><rect x="0" y="0" width="300" height="40" fill="#c9f0c0"/><rect x="0" y="150" width="300" height="40" fill="#c9f0c0"/><line x1="150" y1="40" x2="40" y2="150" stroke="#9b7bf0" stroke-width="8" stroke-linecap="round" class="pl" data-k="p"/><line x1="150" y1="40" x2="150" y2="150" stroke="#2fb38f" stroke-width="8" stroke-linecap="round" class="pl" data-k="g"/><line x1="150" y1="40" x2="230" y2="150" stroke="#ff5d73" stroke-width="8" stroke-linecap="round" class="pl" data-k="r"/><path d="M150,136 L164,136 L164,150" fill="none" stroke="#3a2c4a" stroke-width="2.5"/></svg><div class="label" id="rvl">${L2('邊塊木板最短？撳一撳！','Which plank is shortest? Tap one!')}</div>`;
  $$('.pl',el).forEach(p=>{p.style.cursor='pointer'; p.onclick=()=>{ const g=p.dataset.k==='g'; $('#rvl',el).textContent = g? L2('啱呀！綠色木板同河岸互相垂直，最短！','Yes! The green plank is perpendicular to the bank: shortest!') : L2('再睇清楚，邊塊同河岸成直角？','Look again: which one makes a right angle with the bank?'); g?blip('good'):blip('bad'); };});
 },
 aoSlider(el){ el.innerHTML=`<div class="label" id="ao"></div>`; angleMaker(el,{start:40,onChange:(d,k)=>{ const t=$('#ao',el); t.textContent=L2(KN[k][0],KN[k][1]+' angle'); t.style.color= k==='acute'?'var(--red)':k==='right'?'var(--sky-d)':'var(--purple)'; }}); },
 aoSlider2(el){ WIDGETS.aoSlider(el); },
 clock(el){
  const times=[[3,0],[12,10],[4,0],[9,0],[1,0],[5,0]]; let i=0;
  el.innerHTML=`<div id="ck"></div><div class="label" id="ckl"></div><div class="row"><button class="btn" id="ckn">${L2('轉時間','Change time')}</button><button class="btn yellow" id="cka">${L2('咩角？','Which angle?')}</button></div>`;
  const ang=(h,m)=>{ let d=Math.abs((h%12)*30+m*0.5 - m*6); if(d>180) d=360-d; return d; };
  const draw=(rev)=>{ const [h,m]=times[i]; $('#ck',el).innerHTML=clockSVG(h,m,160); const d=ang(h,m); const k= Math.abs(d-90)<1?'right':d<90?'acute':'obtuse'; $('#ckl',el).textContent= `${h}:${String(m).padStart(2,'0')}` + (rev? ' → '+L2(KN[k][0],KN[k][1]+' angle'):''); };
  $('#ckn',el).onclick=()=>{i=(i+1)%times.length;draw();}; $('#cka',el).onclick=()=>{draw(true);blip('good');}; draw();
 },
 metreStick(el){
  el.innerHTML=`<svg viewBox="0 0 320 110" width="320" height="110" style="width:100%;height:auto"><rect x="10" y="30" width="300" height="40" rx="6" fill="#ffd25e" stroke="#efb52a" stroke-width="3"/>${Array.from({length:101},(_,i)=>`<line x1="${10+i*3}" y1="30" x2="${10+i*3}" y2="${30+(i%10===0?18:i%5===0?12:6)}" stroke="#3a2c4a" stroke-width="${i%10===0?1.8:0.8}"/>`).join('')}${Array.from({length:11},(_,i)=>`<text x="${10+i*30}" y="64" font-size="11" text-anchor="middle" font-weight="600">${i*10}</text>`).join('')}<path d="M10 85 L310 85" stroke="#ff5d73" stroke-width="3"/><path d="M10 78 V92 M310 78 V92" stroke="#ff5d73" stroke-width="3"/><text x="160" y="105" text-anchor="middle" font-weight="700" fill="#ff5d73">1 m = 100 cm</text></svg><div class="row"><div class="stepper"><button id="mm">−</button><b id="mv">1</b><button id="mp">+</button></div><span style="font-size:22px;font-weight:700">${L2('米','m')} = <span id="mc">100</span> ${L2('厘米','cm')}</span></div>`;
  let v=1; const u=()=>{$('#mv',el).textContent=v; $('#mc',el).textContent=v*100;};
  $('#mm',el).onclick=()=>{v=Math.max(1,v-1);u();blip('flip');}; $('#mp',el).onclick=()=>{v=Math.min(9,v+1);u();blip('flip');};
 },
 aboutOne(el){
  el.innerHTML=`<svg viewBox="0 0 300 200" width="300" height="200" style="width:100%;max-width:300px;height:auto"><rect x="20" y="10" width="100" height="180" fill="#f3efe9" stroke="#3a2c4a" stroke-width="3"/><circle cx="105" cy="100" r="6" fill="#3a2c4a"/><path d="M135 100 V190" stroke="#ff5d73" stroke-width="3"/><path d="M128 100 H142 M128 190 H142" stroke="#ff5d73" stroke-width="3"/><text x="150" y="150" fill="#ff5d73" font-weight="700" font-size="16">≈1 m</text><rect x="200" y="98" width="45" height="92" rx="4" fill="#3a9be0" stroke="#3a2c4a" stroke-width="3"/><rect x="196" y="90" width="53" height="12" rx="3" fill="#2a7bc0"/><path d="M262 90 V190" stroke="#9b7bf0" stroke-width="3"/><path d="M255 90 H269 M255 190 H269" stroke="#9b7bf0" stroke-width="3"/><text x="248" y="80" fill="#9b7bf0" font-weight="700" font-size="16">≈1 m</text></svg><div class="label">${L2('門柄高度、回收箱都約 1 米','Door handle height and a bin: about 1 m')}</div>`;
 },
 convertBar(el){
  el.innerHTML=`<div class="row"><div class="stepper"><button id="a1">−</button><b id="av">1</b><button id="a2">+</button></div><span>${L2('米','m')}</span><div class="stepper"><button id="b1">−</button><b id="bv">20</b><button id="b2">+</button></div><span>${L2('厘米','cm')}</span></div><svg id="cb" viewBox="0 0 320 90" width="320" height="90" style="width:100%;height:auto"></svg><div class="label" id="cbl"></div>`;
  let m=1,c=20;
  const draw=()=>{ $('#av',el).textContent=m; $('#bv',el).textContent=c; const tot=m*100+c, sc=300/Math.max(tot,100); let x=10, s='';
   for(let i=0;i<m;i++){ s+=`<rect x="${x}" y="10" width="${100*sc-2}" height="30" rx="5" fill="#6cc4ff"/><text x="${x+50*sc}" y="31" text-anchor="middle" font-size="13" fill="#fff" font-weight="700">1 m</text>`; x+=100*sc; }
   if(c) s+=`<rect x="${x}" y="10" width="${Math.max(c*sc-2,3)}" height="30" rx="5" fill="#ff9f5a"/>`;
   s+=`<rect x="10" y="50" width="${tot*sc-2}" height="30" rx="5" fill="#ff5d73"/><text x="${10+tot*sc/2}" y="71" text-anchor="middle" font-size="14" fill="#fff" font-weight="700">${tot} cm</text>`;
   $('#cb',el).innerHTML=s; $('#cbl',el).textContent = `${m*100} + ${c} = ${tot} ${L2('厘米','cm')}`; };
  $('#a1',el).onclick=()=>{m=Math.max(1,m-1);draw();}; $('#a2',el).onclick=()=>{m=Math.min(3,m+1);draw();};
  $('#b1',el).onclick=()=>{c=Math.max(0,c-(c>10?10:1));draw();}; $('#b2',el).onclick=()=>{c=Math.min(90,c+(c>=10?10:1));draw();};
  draw();
 },
 zeroTrap(el){
  el.innerHTML=`<div style="font-size:26px;font-weight:700;text-align:center">8 ${L2('米','m')} 9 ${L2('厘米','cm')} = ?</div><div class="row"><button class="opt" data-a="89">89</button><button class="opt" data-a="809">809</button><button class="opt" data-a="890">890</button></div><div class="label" id="ztl"></div>`;
  $$('.opt',el).forEach(b=>b.onclick=()=>{ const ok=b.dataset.a==='809'; b.classList.add(ok?'right':'wrong'); $('#ztl',el).textContent= ok? '800 + 9 = 809 ✓' : L2('記得：8 米 = 800 厘米','Remember: 8 m = 800 cm'); ok?blip('good'):blip('bad'); });
 },
 rulerRead(el){
  el.innerHTML=`${rulerSVG(20,80,{w:420})}<div class="label">${L2('80 − 20 = 60 厘米','80 − 20 = 60 cm')}</div>`;
 },
 toolTable(el){
  el.innerHTML=`<div class="row" style="gap:8px">${Object.keys(TOOLN).map(k=>`<button class="opt" data-t="${k}" style="width:120px;font-size:16px">${TOOLSVG[k].replace('<svg ','<svg style="height:46px" ')}${L2(TOOLN[k][0],TOOLN[k][1])}</button>`).join('')}</div><div class="label" id="ttl" style="font-size:18px"></div>`;
  const ex={ruler:['筆袋、杯的高度','pencil case, cup'],soft:['腰圍、袖長','waist, sleeve'],mstick:['掃帚、乒乓球桌','broom, ping-pong table'],tape:['跳遠距離、床','long jump, bed'],wheel:['泳池、小徑','swimming pool, path']};
  $$('.opt',el).forEach(b=>b.onclick=()=>{ $$('.opt',el).forEach(x=>x.classList.remove('right')); b.classList.add('right'); blip('flip'); $('#ttl',el).textContent=L2('例如：'+ex[b.dataset.t][0],'e.g. '+ex[b.dataset.t][1]); });
 },
 wheel(el){
  el.innerHTML=`<svg viewBox="0 0 320 120" width="320" height="120" style="width:100%;height:auto"><line x1="10" y1="100" x2="310" y2="100" stroke="#3a2c4a" stroke-width="3" stroke-dasharray="8 6"/><g id="wh"><circle r="26" fill="#fff" stroke="#3a9be0" stroke-width="5"/><path d="M0 0 L0 -26 M0 0 L22 13 M0 0 L-22 13" stroke="#ffd25e" stroke-width="4"/><path d="M0 0 L40 -60" stroke="#3a9be0" stroke-width="6" stroke-linecap="round"/></g></svg><button class="btn sky" id="whb">${L2('推滾輪！','Push the wheel!')}</button><div class="label"><span id="whc">0</span> ${L2('米','m')}</div>`;
  let x=36, c=0, busy=false; const g=$('#wh',el); g.setAttribute('transform',`translate(${x},74)`);
  $('#whb',el).onclick=()=>{ if(busy) return; busy=true; const st=x, t0=performance.now();
   const step=t=>{ const p=Math.min(1,(t-t0)/700); const nx=st+80*p; g.setAttribute('transform',`translate(${nx},74) rotate(${p*360})`); if(p<1) requestAnimationFrame(step); else { x=nx>260?36:nx; c++; $('#whc',el).textContent=c; blip('flip'); busy=false; if(nx>260) g.setAttribute('transform',`translate(${x},74)`);} };
   requestAnimationFrame(step); };
 },
 unitSort(el){
  const its=shuffle(OBJ.items.slice(0,12)).slice(0,6); let i=0, sc=0;
  el.innerHTML=`<div class="label" id="us"></div><div class="row"><button class="btn red" data-u="m">${L2('米 (m)','m')}</button><button class="btn purple" data-u="cm">${L2('厘米 (cm)','cm')}</button></div><div id="usl" class="label" style="font-size:18px"></div>`;
  const show=()=>{ $('#us',el).textContent= i<its.length? L2(its[i][0],its[i][1]) : L2(`完成！答啱 ${sc} 題`,`Done! ${sc} correct`); };
  $$('[data-u]',el).forEach(b=>b.onclick=()=>{ if(i>=its.length) return; const ok=b.dataset.u===its[i][2]; ok?(sc++,blip('good')):blip('bad'); $('#usl',el).textContent= ok? '✓' : L2('應該係 ','Should be ')+its[i][2]; i++; show(); });
  show();
 },
 bodyRuler(el){
  el.innerHTML=`<img src="img/susu_arms.webp" alt="Susu arm span" style="max-height:200px;width:auto;margin:0 auto"><div class="row" style="gap:8px"><span class="chip">${L2('臂距 ≈ 1 m','Arm span ≈ 1 m')}</span><span class="chip">${L2('指距 ≈ 15 cm','Hand span ≈ 15 cm')}</span></div><div style="font-weight:600;text-align:center">${L2('1 個臂距 + 2 個指距 = 100 + 15 + 15 = ','1 arm span + 2 hand spans = 100 + 15 + 15 = ')}<span id="brs" style="color:var(--red)">?</span></div><button class="btn yellow" id="brb">${L2('計吓！','Work it out!')}</button>`;
  $('#brb',el).onclick=()=>{ $('#brs',el).textContent=L2('130 厘米','130 cm'); blip('good'); };
 },
};

// ---------- game runner ----------
function viewGame(id){
  if(id==='memory') return memoryGame();
  if(id==='maker') return makerGame();
  if(id==='perpmaker') return perpMakerGame();
  const g=GAMES[id]; if(!g) return go('games');
  runQuiz({title:L2(g.zh,g.en), n:g.n, gen:()=>g.gen(), intro:g.intro==='pick'?'g_sort':g.intro, sticker:id});
}
function runQuiz(cfg){
  const m=$('#view'); let qi=0, score=0, wrongs=[]; const qs = cfg.list ? cfg.list : null;
  const N = qs? qs.length : cfg.n;
  const render=()=>{
    if(qi>=N) return finish();
    const q = qs? qs[qi]() : cfg.gen(); let answered=false, tries=0;
    m.innerHTML=`<div class="game-wrap"><button class="back" id="bk">← ${T('more')}</button><div class="game-top"><h2>${cfg.title}</h2><b>${qi+1} / ${N}</b><div class="progress"><i style="width:${qi/N*100}%"></i></div></div>
     <div class="qcard"><div class="qtext">${q.q}${q.sub?`<span class="sub">${q.sub}</span>`:''}</div>${q.art?`<div class="qart">${q.art}</div>`:''}
     <div class="opts">${q.opts.map(o=>`<button class="opt" data-id="${o.id}">${o.svg||''}<span>${o.label}</span>${o.sub?`<small>${o.sub}</small>`:''}</button>`).join('')}</div>
     <div class="feedback" id="fb"></div><div id="hint"></div><div class="next-row"><button class="btn purple" id="nx" hidden>${T('next')} →</button></div></div></div>`;
    $('#bk').onclick=()=>go(cfg.back||'games');
    $$('.opt',m).forEach(b=>b.onclick=()=>{
      if(answered) return;
      if(b.dataset.id===q.ans){ answered=true; b.classList.add('right'); if(tries===0){score++; addStar(1);} $('#fb').className='feedback good'; $('#fb').textContent=T('correct'); praise(); if(tries===0 && qi===N-1) {} $('#nx').hidden=false; }
      else { tries++; b.classList.add('wrong'); b.disabled=true; $('#fb').className='feedback bad'; $('#fb').textContent=T('wrong'); oops(); if(q.hint) $('#hint').innerHTML=`<div class="hintbox">💡 ${q.hint}</div>`.replace('💡 ',''); if(tries===1) wrongs.push(q.q.replace(/<[^>]+>/g,'')+(q.sub?' ('+q.sub+')':'')); if(tries>=2 || q.opts.length<=2){ answered=true; const r=$(`.opt[data-id="${CSS.escape(q.ans)}"]`,m); r.classList.add('right'); $('#nx').hidden=false; } }
    });
    $('#nx').onclick=()=>{qi++;render();};
  };
  const finish=()=>{
    const pct=score/N, st= pct>=.95?3: pct>=.7?2: pct>0?1:0;
    let newSticker=false;
    if(cfg.sticker && (pct>=.8 || (cfg.sticker==='quiz'&&pct===1)) && !stickers[cfg.sticker]){ stickers[cfg.sticker]=1; store.set('stickers',stickers); newSticker=true; }
    m.innerHTML=`<div class="game-wrap"><div class="qcard result"><h2>${T('result')}</h2><img class="cheer" src="img/${pct>=.7?'susu_cheer':'neko_think'}.webp" alt=""><div class="bigstars">${[0,1,2].map(i=>i<st?STAR:STAR0).join('')}</div>
     <p style="font-size:24px;font-weight:700">${lang==='zh'?`${T('score')} ${score} ${T('of')} ${N} ${T('qs')}`:`${T('score')} ${score} ${T('of')} ${N}`}</p>
     ${newSticker?`<p style="font-size:22px;color:var(--purple-d);font-weight:700">${T('sticker_new')}</p>`:''}
     ${wrongs.length?`<div class="review"><b>${T('review')}</b>${wrongs.map(w=>`<div>${w}</div>`).join('')}</div>`:''}
     <div class="next-row"><button class="btn red" id="ag">${T('again')}</button><button class="btn purple" id="mg">${T('more')}</button></div></div></div>`;
    $('#ag').onclick=()=>route(); $('#mg').onclick=()=>go(cfg.back||'games');
    confetti(); blip('win');
    speak(pct===1?'perfect': newSticker?'sticker':'done',{mood:'good'});
  };
  speak(cfg.intro); render();
}

function memoryGame(){
  const m=$('#view');
  const pairs=[
   ['a', fitAngle(40,10,{w:120,h:100,len:70}), L2('銳角','acute angle')],
   ['b', fitAngle(90,0,{w:120,h:100,len:70}), L2('直角','right angle')],
   ['c', fitAngle(130,0,{w:120,h:100,len:60}), L2('鈍角','obtuse angle')],
   ['d', `<svg viewBox="0 0 120 100"><line x1="10" y1="80" x2="110" y2="80" stroke="#3a9be0" stroke-width="6"/><line x1="60" y1="80" x2="60" y2="10" stroke="#ff5d73" stroke-width="6"/><path d="M60 66 L74 66 L74 80" fill="none" stroke="#3a2c4a" stroke-width="3"/></svg>`, L2('垂直線','perpendicular')],
   ['e', '<span style="font-size:26px">1 m</span>', '100 cm'],
   ['f', `<span>2 ${L2('米','m')} 5 ${L2('厘米','cm')}</span>`, '205 cm'],
   ['g', TOOLSVG.wheel, L2('滾輪','trundle wheel')],
   ['h', TOOLSVG.soft, L2('軟尺','soft tape')],
  ];
  const cards=shuffle(pairs.flatMap(([k,a,b])=>[{k,h:a},{k,h:`<span>${b}</span>`}]));
  let open=[], matched=0, moves=0, lock=false;
  m.innerHTML=`<div class="game-wrap"><button class="back" id="bk">← ${T('more')}</button><div class="game-top"><h2>${L2('記憶翻翻樂','Memory Flip')}</h2><b id="mv">${L2('步數','Moves')}: 0</b></div><div class="mem">${cards.map((c,i)=>`<button class="mcard" data-i="${i}" aria-label="card"><div class="in"><div class="f"><img src="img/${i%2?'neko':'susu'}_face.webp" alt=""></div><div class="b">${c.h}</div></div></button>`).join('')}</div></div>`;
  $('#bk').onclick=()=>go('games');
  $$('.mcard',m).forEach(b=>b.onclick=()=>{
    const i=+b.dataset.i; if(lock||b.classList.contains('flip')||b.classList.contains('done')) return;
    b.classList.add('flip'); blip('flip'); open.push([i,b]);
    if(open.length===2){ moves++; $('#mv').textContent=L2('步數','Moves')+': '+moves; lock=true;
      const [[i1,b1],[i2,b2]]=open;
      if(cards[i1].k===cards[i2].k){ setTimeout(()=>{ b1.classList.add('done'); b2.classList.add('done'); open=[]; lock=false; matched++; addStar(1); praise();
         if(matched===pairs.length){ const first=!stickers.memory; stickers.memory=1; store.set('stickers',stickers); confetti(); blip('win'); setTimeout(()=>{ speak(first?'sticker':'done',{mood:'good'}); m.querySelector('.game-wrap').insertAdjacentHTML('beforeend',`<div class="qcard result" style="margin-top:16px"><h2>${T('result')}</h2><p style="font-size:22px">${L2('用咗 '+moves+' 步','Finished in '+moves+' moves')}</p><div class="next-row"><button class="btn red" id="ag">${T('again')}</button><button class="btn purple" id="mg">${T('more')}</button></div></div>`); $('#ag').onclick=()=>memoryGame(); $('#mg').onclick=()=>go('games'); },600);} },400); }
      else { setTimeout(()=>{ b1.classList.remove('flip'); b2.classList.remove('flip'); open=[]; lock=false; },900); }
    }
  });
  speak('g_mem');
}

function makerGame(){
  const m=$('#view'); const tasks=shuffle(['acute','right','obtuse','acute','obtuse','right']); let ti=0, score=0;
  const render=()=>{
    if(ti>=tasks.length){ const first=!stickers.maker; stickers.maker=1; store.set('stickers',stickers); confetti(); blip('win'); speak(first?'sticker':'done',{mood:'good'});
      m.innerHTML=`<div class="game-wrap"><div class="qcard result"><h2>${T('result')}</h2><img class="cheer" src="img/susu_cheer.webp" alt=""><div class="next-row"><button class="btn red" id="ag">${T('again')}</button><button class="btn purple" id="mg">${T('more')}</button></div></div></div>`; $('#ag').onclick=()=>makerGame(); $('#mg').onclick=()=>go('games'); return; }
    const t=tasks[ti];
    m.innerHTML=`<div class="game-wrap"><button class="back" id="bk">← ${T('more')}</button><div class="game-top"><h2>${L2('整角大師','Angle Maker')}</h2><b>${ti+1} / ${tasks.length}</b><div class="progress"><i style="width:${ti/tasks.length*100}%"></i></div></div><div class="qcard"><div class="qtext">${L2('拉動紅點，整一個','Drag the red dot to make an')} <span style="color:${t==='acute'?'var(--red)':t==='right'?'var(--sky-d)':'var(--purple)'}">${L2(KN[t][0],(t==='acute'?'acute':t==='right'?'a right':'obtuse')+' angle')}</span>${L2('！','!')}</div><div class="widget" id="mk" style="border:0;background:none"></div><div class="feedback" id="fb"></div><div class="next-row"><button class="btn mint" id="ck">${T('check')}</button><button class="btn purple" id="nx" hidden>${T('next')} →</button></div></div></div>`;
    $('#bk').onclick=()=>go('games');
    const mk=angleMaker($('#mk'),{start: t==='obtuse'?50: t==='acute'?130:60});
    $('#ck').onclick=()=>{ const k=kindOf(mk.get()); if(k===t){ $('#fb').className='feedback good'; $('#fb').textContent=T('correct')+` (${L2(KN[k][0],KN[k][1])})`; praise(); addStar(1); $('#ck').hidden=true; $('#nx').hidden=false; } else { $('#fb').className='feedback bad'; $('#fb').textContent=L2('而家係'+KN[k][0]+'，再試吓！','That is '+KN[k][1]+'. Try again!'); oops(); } };
    $('#nx').onclick=()=>{ti++;render();};
    speak('g_'+t);
  };
  render();
}

function perpMakerGame(){
  const m=$('#view'); const rots=shuffle([0,20,-30,45,-15]); let ti=0;
  const render=()=>{
    if(ti>=rots.length){ const first=!stickers.perpmaker; stickers.perpmaker=1; store.set('stickers',stickers); confetti(); blip('win'); speak(first?'sticker':'done',{mood:'good'});
      m.innerHTML=`<div class="game-wrap"><div class="qcard result"><h2>${T('result')}</h2><img class="cheer" src="img/neko_cheer.webp" alt=""><div class="next-row"><button class="btn red" id="ag">${T('again')}</button><button class="btn purple" id="mg">${T('more')}</button></div></div></div>`; $('#ag').onclick=()=>perpMakerGame(); $('#mg').onclick=()=>go('games'); return; }
    const base=rots[ti]; let d=rnd(25,60)*(Math.random()<.5?1:-1)+90;
    m.innerHTML=`<div class="game-wrap"><button class="back" id="bk">← ${T('more')}</button><div class="game-top"><h2>${L2('垂直轉轉樂','Spin to Perpendicular')}</h2><b>${ti+1} / ${rots.length}</b><div class="progress"><i style="width:${ti/rots.length*100}%"></i></div></div><div class="qcard"><div class="qtext">${L2('轉動紅線，同藍線互相垂直！','Turn the red line until it is perpendicular to the blue line!')}</div><svg id="ps" viewBox="0 0 300 240" width="300" height="240" style="width:100%;max-width:300px;height:auto"></svg><div class="row"><button class="btn big" id="l">⟲</button><button class="btn big" id="r">⟳</button></div><div class="feedback" id="fb"></div><div class="next-row"><button class="btn mint" id="ck">${T('check')}</button><button class="btn purple" id="nx" hidden>${T('next')} →</button></div></div></div>`;
    $('#bk').onclick=()=>go('games');
    const draw=()=>{ const a=rad(-(base+d)), b=rad(-base);
      $('#ps').innerHTML=`<line x1="${150-130*Math.cos(b)}" y1="${130-130*Math.sin(b)}" x2="${150+130*Math.cos(b)}" y2="${130+130*Math.sin(b)}" stroke="#3a9be0" stroke-width="7" stroke-linecap="round"/><line x1="150" y1="130" x2="${150+100*Math.cos(a)}" y2="${130+100*Math.sin(a)}" stroke="#ff5d73" stroke-width="7" stroke-linecap="round"/><circle cx="150" cy="130" r="6" fill="#3a2c4a"/>`; };
    $('#l').onclick=()=>{d=Math.min(170,d+5);draw();blip('flip');}; $('#r').onclick=()=>{d=Math.max(10,d-5);draw();blip('flip');};
    $('#ck').onclick=()=>{ if(d===90){ $('#fb').className='feedback good'; $('#fb').textContent=L2('互相垂直！','Perpendicular!'); praise(); addStar(1); const a=rad(-(base+90)), b=rad(-base); $('#ps').insertAdjacentHTML('beforeend',`<path d="M${150+18*Math.cos(b)},${130+18*Math.sin(b)} L${150+18*Math.cos(b)+18*Math.cos(a)},${130+18*Math.sin(b)+18*Math.sin(a)} L${150+18*Math.cos(a)},${130+18*Math.sin(a)}" fill="none" stroke="#3a2c4a" stroke-width="3"/>`); $('#ck').hidden=true; $('#nx').hidden=false; } else { $('#fb').className='feedback bad'; $('#fb').textContent=L2('仲未成直角，再轉吓！','Not a right angle yet, keep turning!'); oops(); } };
    $('#nx').onclick=()=>{ti++;render();};
    draw(); d = Math.round(d/5)*5; draw(); speak('g_perp');
  };
  render();
}

// ---------- quiz (exam style, mirrors worksheets) ----------
function quizList(){
  const Q=[];
  const mc=(q,art,opts,ans,hint,sub)=>()=>({q,art,opts:opts.map(o=>typeof o==='object'?o:{id:String(o),label:String(o)}),ans:String(ans),hint,sub});
  // angles count
  Q.push(()=>{ const s=pick([SHAPES[2],SHAPES[3],SHAPES[9],SHAPES[8]]); return GAMES.count.gen.call(null) && {q:L2('以下平面圖形內有角多少個？','How many angles are there in this shape?'),art:s.svg(),opts:shuffle([s.n,s.n+1,Math.max(0,s.n-1),s.n+2]).map(n=>({id:String(n),label:L2(n+' 個',String(n))})),ans:String(s.n),hint:L2('彎線唔會形成角。','Curved lines do not form angles.')}; });
  Q.push(()=>({q:L2('以下哪個平面圖形冇角？','Which shape has NO angles?'),opts:[{id:'a',svg:SHAPES[6].svg(),label:'A'},{id:'b',svg:SHAPES[0].svg(),label:'B'},{id:'c',svg:SHAPES[9].svg(),label:'C'}],ans:'a',hint:L2('彎彎嘅邊唔會形成角。','Curved sides make no angles.')}));
  Q.push(()=>GAMES.compare.gen());
  Q.push(()=>GAMES.compare.gen());
  Q.push(()=>GAMES.sort.gen());
  Q.push(()=>GAMES.sort.gen());
  Q.push(()=>{ const ang=[[40,'a'],[90,'b'],[25,'c'],[90,'d'],[120,'e']]; const art=`<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:4px">${ang.map(([d,l])=>fitAngle(d,pick([0,15]),{w:110,h:90,len:60,label:l})).join('')}</div>`;
    return {q:L2('以下邊組全部都係直角？','Which group shows ALL the right angles?'),art,opts:[{id:'bd',label:L2('角 b、角 d','b, d')},{id:'ac',label:L2('角 a、角 c','a, c')},{id:'be',label:L2('角 b、角 e','b, e')}],ans:'bd',hint:L2('直角好似直尺嘅角。','A right angle looks like the corner of a ruler.')}; });
  Q.push(()=>GAMES.perp.gen());
  Q.push(()=>GAMES.perp.gen());
  Q.push(()=>({q:L2('以下哪個平面圖形有互相垂直的直線？','Which shape has perpendicular lines?'),opts:[{id:'a',svg:polySVG([[20,140],[20,30],[150,140]],{marks:true}),label:'A'},{id:'b',svg:SHAPES[2].svg(),label:'B'},{id:'c',svg:SHAPES[5].svg(),label:'C'}],ans:'a',hint:L2('搵吓有冇直角。','Look for a right angle.')}));
  Q.push(()=>GAMES.clock.gen());
  Q.push(()=>{ return {q:L2('一個三角形有 1 個鈍角，佢仲有幾多個銳角？','A triangle has 1 obtuse angle. How many acute angles does it have?'),art:polySVG([[15,130],[185,130],[70,60]],{marks:true}),opts:[0,1,2,3].map(n=>({id:String(n),label:String(n)})),ans:'2',hint:L2('數吓細過直角嘅角。','Count the angles smaller than a right angle.')}; });
  // metre
  Q.push(()=>GAMES.convert.gen());
  Q.push(()=>GAMES.convert.gen());
  Q.push(()=>({q:L2('600 厘米 = ? 米','600 cm = ? m'),opts:[6,60,600,'0.6'].map(n=>({id:String(n),label:L2(n+' 米',n+' m')})),ans:'6',hint:L2('100 厘米 = 1 米','100 cm = 1 m')}));
  Q.push(()=>GAMES.ruler.gen());
  Q.push(()=>GAMES.unit.gen());
  Q.push(()=>GAMES.tool.gen());
  Q.push(()=>({q:L2('一輛小巴長約？','A minibus is about how long?'),opts:[L2('7 厘米','7 cm'),L2('7 米','7 m'),L2('70 厘米','70 cm'),L2('70 米','70 m')].map((l,i)=>({id:String(i),label:l})),ans:'1',hint:L2('小巴好長，用米！','A minibus is long, so use metres!')}));
  Q.push(()=>{ const a=rnd(2,5), b=rnd(1,4), c=rnd(10,80); const tot=a*100+ b*100+c; return {q:L2(`滑梯同秋千相距 ${a} 米，秋千同吊架相距 ${b} 米 ${c} 厘米。由滑梯經秋千去吊架共行幾多厘米？`,`Slide to swing is ${a} m. Swing to bars is ${b} m ${c} cm. How many cm from slide to swing to bars?`),opts:shuffle([tot,tot-100,a*100+b+c,tot+10]).map(n=>({id:String(n),label:n+' cm'})),ans:String(tot),hint:L2(`${a*100} + ${b*100+c} = ${tot}`,`${a*100} + ${b*100+c} = ${tot}`)}; });
  return Q;
}
function viewQuiz(){
  const m=$('#view');
  m.innerHTML=`<div class="game-wrap"><div class="qcard result"><img class="cheer" src="img/susu_think.webp" alt=""><h2 style="font-size:34px">${T('quiz_t')}</h2><p style="font-size:20px">${T('quiz_p')}</p><div class="next-row"><button class="btn big red" id="qs">${T('quiz_start')}</button></div></div></div>`;
  $('#qs').onclick=()=>{ runQuiz({title:T('quiz_t'), list:quizList(), intro:'quiz', sticker:'quiz', back:'quiz'}); };
}
function viewStickers(){
  const m=$('#view');
  const name=id=> id==='quiz'? L2('小測滿分','Quiz star') : (GAMES[id]? L2(GAMES[id].zh,GAMES[id].en) : L2(SPECIAL[id].zh,SPECIAL[id].en));
  m.innerHTML=`<h2 class="section-title">${T('stickers_t')}</h2><p>${T('stickers_p')}</p><div class="stickers">${STICKER_LIST.map(([id,c])=>{ const has=stickers[id]; const face=STICKER_ART[id];
    const art = `<svg viewBox="0 0 100 100"><defs><clipPath id="cp${id}"><circle cx="50" cy="50" r="40"/></clipPath></defs><circle cx="50" cy="50" r="47" fill="${c}" stroke="#fff" stroke-width="5"/>${face==='both'?`<image href="img/susu_face.webp" x="5" y="15" width="50" height="50" clip-path="url(#cp${id})"/><image href="img/neko_face.webp" x="45" y="15" width="50" height="50" clip-path="url(#cp${id})"/>`:`<image href="img/${face}.webp" x="10" y="10" width="80" height="80" clip-path="url(#cp${id})"/>`}<path d="M50 3 l4 8 9 1 -7 6 2 9 -8-5 -8 5 2-9 -7-6 9-1z" fill="#ffd25e" stroke="#efb52a" stroke-width="1.5" transform="translate(28,0) scale(.5)"/></svg>`;
    return `<div class="sticker ${has?'':'locked'}">${art}<b>${name(id)}</b><small>${has?L2('已獲得','Unlocked'):L2('未獲得','Locked')}</small></div>`; }).join('')}</div>`;
  showBuddy(Object.keys(stickers).length?'s':'n','good',L2('你已經有 '+Object.keys(stickers).length+' 張貼紙！','You have '+Object.keys(stickers).length+' stickers!'));
}

// ---------- boot ----------
function start(l){
  lang=l; store.set('lang',lang);
  $('#splash').hidden=true; $('#app').hidden=false; i18n();
  $('#starNum').textContent=stars; $('#sndBtn').classList.toggle('muted',!sound);
  if(!location.hash) location.hash='home'; route();
  setTimeout(()=>speak('hello',{mood:'good'}),300);
}
$$('[data-start]').forEach(b=>b.onclick=()=>start(b.dataset.start));
$$('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));
$('#langBtn').onclick=()=>{ lang= lang==='zh'?'en':'zh'; store.set('lang',lang); i18n(); route(); };
$('#sndBtn').onclick=()=>{ sound=!sound; store.set('sound',sound); $('#sndBtn').classList.toggle('muted',!sound); if(!sound) audio.pause(); };
$('#replay').onclick=()=>{ if(lastKey){ const s=sound; sound=true; speak(lastKey); sound=s; } };
$('#bubbleText').onclick=()=>$('#bubble').classList.add('hide');
$('#buddyImg').onclick=()=>speak(pick(['hello','hello2','ok3','ok4']),{mood:'good'});
window.addEventListener('hashchange',()=>{ if(!$('#app').hidden) route(); });
if (location.search.includes('qa')) window.__qa={GAMES,quizList,setLang:l=>{lang=l;}};
})();
