// ===== missions.js : daily + career missions. They are the only way to earn ES =====
// Progress is counted by wrapping kill / hurtB / endMatch, so game.js itself stays untouched.
const MS_POOL=[
 {id:'k15',t:'۱۵ حذف در مسابقه‌ها',ev:'kill',n:15,es:5},
 {id:'hs5',t:'۵ هدشات',ev:'hs',n:5,es:5},
 {id:'m3',t:'۳ مسابقه بازی کن',ev:'match',n:3,es:3},
 {id:'w1',t:'۱ پیروزی',ev:'win',n:1,es:8},
 {id:'br1',t:'۱ مسابقه بتل رویال',ev:'br',n:1,es:5},
 {id:'sn5',t:'۵ حذف با اسنایپر',ev:'sn',n:5,es:6}];
const MS_CAREER=[
 {id:'ck100',t:'۱۰۰ حذف در کل',get:()=>S.kills,n:100,es:20},
 {id:'cw10',t:'۱۰ پیروزی در کل',get:()=>S.wins,n:10,es:25},
 {id:'cl10',t:'رسیدن به لول ۱۰',get:()=>S.lv,n:10,es:15}];
// p = daily progress, dc = daily claimed (both reset each local day), cc = career claimed (kept forever)
S.ms=Object.assign({day:-1,p:{},dc:{},cc:{}},S.ms);
const msDay=()=>Math.floor((Date.now()-new Date().getTimezoneOffset()*6e4)/864e5);
function msRoll(){if(S.ms.day!==msDay()){S.ms.day=msDay();S.ms.p={};S.ms.dc={}}}
const msDaily=()=>{msRoll();return[0,2,4].map(i=>MS_POOL[(S.ms.day+i)%MS_POOL.length])};
let msFresh=[];
function msAdd(ev,n){n=n||1;for(const m of msDaily())if(m.ev===ev){const b=S.ms.p[m.id]||0,a=Math.min(m.n,b+n);S.ms.p[m.id]=a;if(b<m.n&&a>=m.n)msFresh.push(m.t)}}
function msRows(){return msDaily().map(m=>({k:'d',m,c:S.ms.p[m.id]||0,cl:!!S.ms.dc[m.id]})).concat(MS_CAREER.map(m=>({k:'c',m,c:m.get(),cl:!!S.ms.cc[m.id]})))}
const msReady=()=>msRows().some(r=>r.c>=r.m.n&&!r.cl);
function msClaim(k,id){const r=msRows().find(x=>x.k==k&&x.m.id==id);if(!r||r.c<r.m.n||r.cl)return;(k=='d'?S.ms.dc:S.ms.cc)[id]=1;S.es+=r.m.es;save();view('ms');toast('+'+r.m.es+' ES دریافت شد')}
function msHTML(){
 const row=r=>{const c=Math.min(r.m.n,r.c),done=c>=r.m.n;
  return '<div class="row"><div class="rt" style="flex:1"><b>'+r.m.t+'</b><div class="xpb"><i style="width:'+c/r.m.n*100+'%"></i></div><small>'+c+' / '+r.m.n+'</small></div>'+
   '<button '+(done&&!r.cl?'':'disabled')+' onclick="msClaim(\''+r.k+'\',\''+r.m.id+'\')">'+(r.cl?'دریافت شد':done?'دریافت ':'')+(r.cl?'':'+'+r.m.es+' '+ICO.ES)+'</button></div>'};
 const rows=msRows();
 return '<h3>مأموریت‌های امروز (با تغییر روز عوض می‌شوند)</h3>'+rows.filter(r=>r.k=='d').map(row).join('')+'<h3>مأموریت‌های بلندمدت</h3>'+rows.filter(r=>r.k=='c').map(row).join('')}
// ---- progress hooks ----
(function(){
 const _kill=kill,_hurtB=hurtB,_end=endMatch;
 kill=function(v,a){_kill(v,a);if(state=='play'&&a===P&&v!==P){msAdd('kill');if(WP[S.sel].t=='sn')msAdd('sn')}};
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
