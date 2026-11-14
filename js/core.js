// ===== core.js : helpers, game data, saved state, audio =====
const $=id=>document.getElementById(id),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rr=(a,b)=>a+Math.random()*(b-a);
const aLerp=(a,b,t)=>a+(((b-a+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI)*t;
const KEY='elis_strike_v3',hx=c=>'#'+c.toString(16).padStart(6,'0');
const W=(n,t,dmg,rof,mag,rl,sp,pel,auto,zoom,len,price)=>({n,t,dmg,rof,mag,rl,sp,pel,auto,zoom,len,price});
const WP={ar:W('AR-M','ar',24,.1,30,2,.02,1,1,55,.62,0),smg:W('SMG-X','smg',15,.06,40,1.6,.04,1,1,60,.42,0),
kn:W('KN-44','ar',27,.11,30,2.1,.022,1,1,55,.64,800),ak:W('AK-47','ar',32,.12,30,2.3,.03,1,1,55,.66,1200),
mp:W('MP-5','smg',17,.07,30,1.7,.035,1,1,58,.44,700),vc:W('Vector','smg',13,.045,33,1.5,.045,1,1,60,.4,1400),
sg:W('SG-12','sg',13,.8,6,2.2,.07,8,0,60,.62,1000),sn:W('SR-Hawk','sn',105,1.1,5,2.6,.002,1,0,22,.9,1500),
ds:W('DSR-50','sn',160,1.6,4,3,.001,1,0,20,.95,2500),lmg:W('LMG-Titan','lmg',21,.075,100,4.5,.05,1,1,55,.7,1800),pi:W('P-9','pi',22,.14,15,1.2,.025,1,0,60,.3,400)};
Object.assign(WP,{rv:W('Raven','sn',125,.9,5,2.4,.001,1,0,20,.95,2200),vu:W('Vulcan-S','sn',72,.34,10,2.6,.004,1,0,22,.92,2600),am:W('Anti-Mat','sn',260,2.2,3,3.2,.001,1,0,18,1.0,3500),
pm:W('Pump-870','sg',12,.9,6,2.4,.065,9,0,60,.66,900),as:W('Auto-SG','sg',9,.32,8,2.2,.07,6,1,60,.64,1700),db:W('Double-X','sg',12,.5,2,2.5,.08,12,0,60,.6,1300),
m7:W('MP7','smg',14,.055,40,1.5,.04,1,1,60,.38,900),um:W('UMP','smg',19,.085,25,1.7,.035,1,1,58,.44,1100),p9:W('P90','smg',15,.05,50,1.9,.045,1,1,60,.44,1600),bz:W('Bizon','smg',12,.06,64,2.2,.05,1,1,60,.46,1500)});
const RAR=[['معمولی',0x7f8c8d],['کمیاب',0x2e86de],['حماسی',0xa55eea],['Legendary افسانه‌ای',0xf1c40f],['Mythic اسطوره‌ای',0xff2d3d]];
const SCP=[{n:'بدون اسکوپ',z:0},{n:'Red Dot',z:52},{n:'Holo',z:48},{n:'اسکوپ ۴x',z:28,ov:1},{n:'اسکوپ ۸x',z:12,ov:1}],MZ=['بدون','سایلنسر','کامپنسیتور'],GR=['بدون','دستگیره عمودی','لیزر'],MG=['استاندارد','خشاب بزرگ'],PAT=['ساده','ارتشی','راه‌راه','دیجیتال','خط‌دار','لانه‌زنبوری'];
SCP[1].r='dot';SCP[2].r='ho';SCP[3].r='ac';SCP[4].r='sn';SCP.push({n:'اسکوپ ۱۲x',z:8,ov:1,r:'sn'},{n:'Thermal ۶x',z:20,ov:1,r:'th'},{n:'Holo ۲x',z:40,r:'ho'});
PAT.push('ببری','کربن','شعله','مدار','فلس اژدها','ستاره‌ای');
const COL=[0,0xe74c3c,0xe67e22,0xf1c40f,0x2ecc71,0x1abc9c,0x3498db,0x9b59b6,0xff6fb5,0xecf0f1,0x2c3e50],COLN=['پیش‌فرض','قرمز','نارنجی','طلایی','سبز','فیروزه‌ای','آبی','بنفش','صورتی','سفید','سرمه‌ای'];
const OPS=[{n:'گشت',c:0x2e6fd1},{n:'سایه',c:0x222a33},{n:'جنگل',c:0x3d6b3a},{n:'صحرا',c:0xb59a5a},{n:'سرخ',c:0xc0392b},{n:'ارغوانی',c:0x8e44ad},{n:'طلایی',c:0xd4a017},{n:'یخی',c:0x7fd4e8}];
const DF=[.45,.75,1,1.3,1.7],DD=[.5,.75,1,1.25,1.6],DN=['خیلی آسان','آسان','معمولی','سخت','کابوس'],NM=['همه‌علیه‌همه','تیمی ۴ در ۴','مراحل (کمپین)'];
NM.push('بتل رویال سولو (۱۰۰)','بتل رویال اسکواد (۴ نفره)');
const MT=[{n:'انبار',g:'#6b6b66',f:0xaebfcc,w:'#5a6068',t:'rib',c:['#b5412e','#2e6fb5','#c9a227','#3d7a52'],h:3,bc:0xa83228,r:0},
{n:'شهر متروکه',g:'#4a4f55',f:0xaebfcc,w:'#5a6068',t:'win',c:['#707880','#8a6f62'],h:12,bc:0x5a6b3c,r:0,k:1},
{n:'پایگاه صحرایی',g:'#b89a62',f:0xd8c9a6,w:'#a8946a',t:'bag',c:['#c2ab7a','#9a8a6a'],h:2.4,bc:0x6b7a4a,r:9},
{n:'کارخانه',g:'#555a5e',f:0x9aa3a8,w:'#6a6f74',t:'rib',c:['#b5412e','#7a7f86','#c9a227'],h:5,bc:0xa83228,r:0},
{n:'قطب شمال',g:'#dfe8ee',f:0xdfe8f0,w:'#cfd8dc',t:'brick',c:['#9fb3c4','#7a8c99'],h:4,bc:0x5a7a9a,r:6},
{n:'جنگل',g:'#3f5a34',f:0x8fa88a,w:'#3b4a35',t:'bag',c:['#4a6b3a','#6b5a3a','#3d5a45'],h:3.6,bc:0x556b3c,r:10},
{n:'اسکله',g:'#46586a',f:0x9db2c4,w:'#4f6070',t:'rib',c:['#2e6fb5','#b5412e','#c9a227'],h:4.5,bc:0x3b5f8a,r:2},
{n:'پشت‌بام شهر',g:'#2c3036',f:0x6b7a90,w:'#3b414a',t:'win',c:['#707880','#8a6f62','#4a5058'],h:9,bc:0x666c70,r:0,k:1},
{n:'مریخ',g:'#8a4a32',f:0xc08060,w:'#6e3a28',t:'bag',c:['#a8603c','#7a3a28','#b5784c'],h:4,bc:0x8a4a32,r:12}];
const MAPN=MT.map(m=>m.n);
const LV=[{map:0,n:4,goal:8,sk:.35},{map:1,n:5,goal:12,sk:.45},{map:2,n:6,goal:15,sk:.55},{map:3,n:6,goal:18,sk:.65},{map:4,n:7,goal:20,sk:.75},{map:5,n:7,goal:22,sk:.85},{map:6,n:8,goal:25,sk:.95},{map:7,n:9,goal:28,sk:1.05},{map:8,n:10,goal:32,sk:1.2}];
let S={name:'Player'+(Math.random()*900+100|0),xp:0,lv:1,coins:600,owned:{ar:0,smg:0},sel:'ar',kills:0,wins:0,daily:0,mode:0,map:0,cl:0,camp:0,op:0,lo:[null,null],att:{},set:{}};
try{Object.assign(S,JSON.parse(localStorage.getItem(KEY))||{})}catch(e){}
S.set=Object.assign({sens:5,fov:75,q:1,vol:7,diff:2,bs:1,lay:{},ad:5},S.set);
const save=()=>{try{const o=Object.assign({},S);if(state=='play'&&P.keep)o.sel=P.keep;localStorage.setItem(KEY,JSON.stringify(o))}catch(e){}};
const need=()=>150+S.lv*100;
function att(k){const a=S.att[k]||{};return{sc:a.sc===undefined?(WP[k].t=='sn'?4:0):a.sc,mz:a.mz||0,gr:a.gr||0,mg:a.mg||0,pt:a.pt||0,cl:a.cl||0}}
const mg=k=>Math.round(WP[k].mag*(att(k).mg?1.5:1)),zm=()=>SCP[att(S.sel).sc].z||WP[S.sel].zoom;
function addXP(x){S.xp+=x;let up=0;while(S.xp>=need()){S.xp-=need();S.lv++;S.coins+=S.lv*50;up++}return up}
let AC;function snd(f,d,t,v){try{AC=AC||new(window.AudioContext||webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain();o.type=t||'square';o.frequency.value=f;g.gain.value=(v||.05)*S.set.vol/7;o.connect(g);g.connect(AC.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+d);o.stop(AC.currentTime+d)}catch(e){}}
function fs(){try{const e=document.documentElement;(e.requestFullscreen||e.webkitRequestFullscreen).call(e);if(screen.orientation&&screen.orientation.lock)screen.orientation.lock('landscape').catch(()=>{})}catch(x){}}
