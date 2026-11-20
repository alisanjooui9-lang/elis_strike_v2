// ===== missions.js : rotating missions + career missions. They are the only way to earn ES =====
// Progress is counted by wrapping kill / hurtB / endMatch, so game.js itself stays untouched.
// Rules for the current set (3 missions):
//   * finish and claim all of them  -> a fresh set of different missions appears at once (new 24h timer)
//   * not all claimed within 24h    -> the set restarts: new missions, progress back to zero.
//     Missions that were already completed but not claimed are paid out automatically, so nothing is lost.
const MS_POOL=[
 {id:'k15',t:'۱۵ حذف در مسابقه‌ها',ev:'kill',n:15,es:5},
 {id:'k30',t:'۳۰ حذف در مسابقه‌ها',ev:'kill',n:30,es:9},
 {id:'hs5',t:'۵ هدشات',ev:'hs',n:5,es:5},
 {id:'hs12',t:'۱۲ هدشات',ev:'hs',n:12,es:9},
 {id:'m3',t:'۳ مسابقه بازی کن',ev:'match',n:3,es:3},
 {id:'m6',t:'۶ مسابقه بازی کن',ev:'match',n:6,es:6},
 {id:'w1',t:'۱ پیروزی',ev:'win',n:1,es:8},
 {id:'w3',t:'۳ پیروزی',ev:'win',n:3,es:15},
 {id:'br1',t:'۱ مسابقه بتل رویال',ev:'br',n:1,es:5},
 {id:'br3',t:'۳ مسابقه بتل رویال',ev:'br',n:3,es:10},
 {id:'sn5',t:'۵ حذف با اسنایپر',ev:'k_sn',n:5,es:6},
 {id:'sn12',t:'۱۲ حذف با اسنایپر',ev:'k_sn',n:12,es:11},
 {id:'ar12',t:'۱۲ حذف با تفنگ AR',ev:'k_ar',n:12,es:6},
 {id:'smg12',t:'۱۲ حذف با SMG',ev:'k_smg',n:12,es:6},
 {id:'sg8',t:'۸ حذف با شاتگان',ev:'k_sg',n:8,es:6},
 {id:'lmg10',t:'۱۰ حذف با LMG',ev:'k_lmg',n:10,es:7},
 {id:'pi6',t:'۶ حذف با تپانچه',ev:'k_pi',n:6,es:7}];
const MS_CAREER=[
 {id:'ck100',t:'۱۰۰ حذف در کل',get:()=>S.kills,n:100,es:20},
 {id:'cw10',t:'۱۰ پیروزی در کل',get:()=>S.wins,n:10,es:25},
 {id:'cl10',t:'رسیدن به لول ۱۰',get:()=>S.lv,n:10,es:15}];
const MS_BY={};MS_POOL.forEach(m=>MS_BY[m.id]=m);
const MS_SIZE=3,MS_MS=24*36e5;
// S.ms.b = current set {ids, start (ms timestamp), p: progress by id, cl: claimed by id}; S.ms.cc = career claimed (kept forever)
S.ms=Object.assign({cc:{}},S.ms);
delete S.ms.day;delete S.ms.p;delete S.ms.dc; // keys of the old per-day system
let msLate=0,msFresh=[];
// pick MS_SIZE missions with different event types, never the ones from the previous set
function msPick(prev){const sh=MS_POOL.filter(m=>!(prev||[]).includes(m.id)).sort(()=>Math.random()-.5),out=[],evs=new Set();
 for(const m of sh){if(out.length>=MS_SIZE)break;if(!evs.has(m.ev)){out.push(m.id);evs.add(m.ev)}}
 for(const m of sh){if(out.length>=MS_SIZE)break;if(!out.includes(m.id))out.push(m.id)}
 return out}
function msNew(prev){S.ms.b={ids:msPick(prev),start:Date.now(),p:{},cl:{}}}
// Always called before the set is read, so expiry and renewal happen automatically.
function msRoll(){const b=S.ms.b,now=Date.now();
 if(!b||!Array.isArray(b.ids)||!b.ids.length||b.ids.some(i=>!MS_BY[i])||typeof b.p!='object'||typeof b.cl!='object'){msNew();return}
 if(b.start>now)b.start=now;
 if(now-b.start>=MS_MS){let es=0;for(const i of b.ids)if((b.p[i]||0)>=MS_BY[i].n&&!b.cl[i])es+=MS_BY[i].es;
  if(es){S.es+=es;msLate+=es}msNew(b.ids);save();return}
 if(b.ids.every(i=>b.cl[i])){msNew(b.ids);save()}}
const msDaily=()=>{msRoll();return S.ms.b.ids.map(i=>MS_BY[i])};
const msLeft=()=>Math.max(0,S.ms.b.start+MS_MS-Date.now());
const msFmt=t=>{const h=Math.floor(t/36e5),m=Math.floor(t%36e5/6e4),s=Math.floor(t%6e4/1e3),p=n=>String(n).padStart(2,'0');return p(h)+':'+p(m)+':'+p(s)};
function msAdd(ev,n){n=n||1;msRoll();const b=S.ms.b;for(const id of b.ids){const m=MS_BY[id];if(m.ev!==ev)continue;const o=b.p[id]||0,a=Math.min(m.n,o+n);b.p[id]=a;if(o<m.n&&a>=m.n)msFresh.push(m.t)}}
function msRows(){msRoll();const b=S.ms.b;return b.ids.map(id=>({k:'d',m:MS_BY[id],c:b.p[id]||0,cl:!!b.cl[id]})).concat(MS_CAREER.map(m=>({k:'c',m,c:m.get(),cl:!!S.ms.cc[m.id]})))}
const msReady=()=>msRows().some(r=>r.c>=r.m.n&&!r.cl);
function msClaim(k,id){const r=msRows().find(x=>x.k==k&&x.m.id==id);if(!r||r.c<r.m.n||r.cl)return;
 const before=S.ms.b;(k=='d'?S.ms.b.cl:S.ms.cc)[id]=1;S.es+=r.m.es;msRoll();const renewed=S.ms.b!==before;save();view('ms');
 toast('+'+r.m.es+' ES دریافت شد'+(renewed?' · مأموریت‌های جدید آمد':''))}
function msHTML(){
 const row=r=>{const c=Math.min(r.m.n,r.c),done=c>=r.m.n;
  return '<div class="row"><div class="rt" style="flex:1"><b>'+r.m.t+'</b><div class="xpb"><i style="width:'+c/r.m.n*100+'%"></i></div><small>'+c+' / '+r.m.n+'</small></div>'+
   '<button '+(done&&!r.cl?'':'disabled')+' onclick="msClaim(\''+r.k+'\',\''+r.m.id+'\')">'+(r.cl?'دریافت شد':done?'دریافت ':'')+(r.cl?'':'+'+r.m.es+' '+ICO.ES)+'</button></div>'};
 const rows=msRows(),late=msLate;msLate=0;
 return (late?'<p>زمان مأموریت‌های قبلی تمام شد. جایزه‌ی مأموریت‌های کامل‌شده (+'+late+' ES) خودکار به حسابت اضافه شد.</p>':'')+
  '<h3>مأموریت‌های فعلی</h3><p>همه را تمام و دریافت کن تا مأموریت‌های جدید بیاید. اگر تا پایان زمان تمام نشوند، همه از نو شروع می‌شوند.<br>زمان باقی‌مانده: <b dir="ltr" id="mst">'+msFmt(msLeft())+'</b></p>'+
  rows.filter(r=>r.k=='d').map(row).join('')+'<h3>مأموریت‌های بلندمدت</h3>'+rows.filter(r=>r.k=='c').map(row).join('')}
// live countdown while the missions screen is open; also renews the set when the time runs out
setInterval(()=>{if(state!='lobby')return;const el=$('mst');if(!el)return;const b=S.ms.b;msRoll();if(S.ms.b!==b){if(curView=='ms')view('ms');return}el.textContent=msFmt(msLeft())},1000);
// ---- progress hooks ----
(function(){
 const _kill=kill,_hurtB=hurtB,_end=endMatch;
 kill=function(v,a){_kill(v,a);if(state=='play'&&a===P&&v!==P){msAdd('kill');msAdd('k_'+WP[S.sel].t)}};
 hurtB=function(b,d,a,head){_hurtB(b,d,a,head);if(a===P&&head)msAdd('hs')};
 endMatch=function(){
  if(state!='play')return _end();
  const w0=S.wins,br=S.mode>2,c0=MS_CAREER.map(m=>m.get()>=m.n);
  _end();
  msAdd('match');if(br)msAdd('br');if(S.wins>w0)msAdd('win');
  MS_CAREER.forEach((m,i)=>{if(!c0[i]&&m.get()>=m.n)msFresh.push(m.t)});
  save();
  if(msFresh.length){const b=$('mv').querySelector('button');if(b)b.insertAdjacentHTML('beforebegin','<p>✔ مأموریت کامل شد: '+msFresh.join('، ')+'<br>برای گرفتن جایزه به بخش مأموریت‌ها برو</p>');msFresh=[]}};
})();
