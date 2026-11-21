// ===== wheel.js : prize wheel (replaces the old prize boxes) =====
// A Call-of-Duty style reel: cards showing the real 3D gun models scroll past a pointer and slow down on the prize.
// The prize is decided and saved BEFORE the animation starts, so leaving the screen mid-spin never loses it.
// Spins are paid with ES (the premium currency earned from missions). p = price in ES.
// od = chance in % for each rarity, from common to mythic (same odds as the old boxes).
const WH=[
 {n:'گردونه معمولی',p:30,od:[50,30,13,5,2]},
 {n:'گردونه کمیاب',p:70,od:[10,50,25,10,5]},
 {n:'گردونه اسطوره‌ای',p:200,od:[0,0,50,35,15]},
 {n:'گردونه اسنایپر',p:100,od:[30,35,20,10,5],pool:['sn','ds','rv','vu','am']},
 {n:'گردونه شاتگان و SMG',p:70,od:[30,35,20,10,5],pool:['sg','pm','as','db','smg','mp','vc','m7','um','p9','bz']}];
const WH_CW=116,WH_GAP=8,WH_STEP=WH_CW+WH_GAP,WH_N=48,WH_WIN=40;
let whSel=0,whBusy=0;
const WI={}; // gun picture cache: "weaponKey_rarity" -> PNG data URL

// Renders the real gun model (side view, transparent background) into a small PNG with the game's own renderer.
// Returns '' if rendering fails, and the cards then simply show the name without a picture.
function gunIcon(k,ri){const key=k+'_'+ri;if(WI[key]!==undefined)return WI[key];
 let url='';
 try{const w=WP[k],L=w.len,W=256,H=128,s=new THREE.Scene(),g=gunModel(k,ri,{sc:w.t=='sn'?4:0,mz:0,gr:0,mg:0,pt:0,cl:0});
  s.add(new THREE.AmbientLight(0xffffff,.9));const dl=new THREE.DirectionalLight(0xffffff,.9);dl.position.set(3,4,2);s.add(dl);s.add(g);
  const cz=-(L*1.2-.1)/2,hw=(L*1.2+.1)/2+.08,hh=hw*H/W,cm=new THREE.OrthographicCamera(-hw,hw,hh,-hh,.1,20);
  cm.position.set(5,.02,cz);cm.lookAt(0,.02,cz); // looking along -x: the barrel (-z) points to the right of the picture
  const rt=new THREE.WebGLRenderTarget(W,H),px=new Uint8Array(W*H*4),oc=new THREE.Color(),oa=R.getClearAlpha();R.getClearColor(oc);
  R.setRenderTarget(rt);R.setClearColor(0x000000,0);R.clear();R.render(s,cm);R.readRenderTargetPixels(rt,0,0,W,H,px);
  R.setRenderTarget(null);R.setClearColor(oc,oa);rt.dispose();disposeTree(g,1);
  const cv=document.createElement('canvas');cv.width=W;cv.height=H;const cx=cv.getContext('2d'),im=cx.createImageData(W,H);
  for(let y=0;y<H;y++)im.data.set(px.subarray((H-1-y)*W*4,(H-y)*W*4),y*W*4); // WebGL rows are bottom-up
  cx.putImageData(im,0,0);url=cv.toDataURL('image/png')}catch(e){url=''}
 return WI[key]=url}

function whRoll(c){const r=Math.random()*100;let acc=0;for(let j=0;j<5;j++){acc+=c.od[j];if(r<acc)return j}return 4}
// Decides the prize and applies it to the player's data (new weapon / rarity upgrade / duplicate refund).
function whDraw(c){const ri=whRoll(c),ks=c.pool||Object.keys(WP),k=ks[Math.random()*ks.length|0];let tag,msg;
 if(S.owned[k]===undefined){S.owned[k]=ri;tag='new';msg='اسلحه جدید!'}
 else if(S.owned[k]<ri){S.owned[k]=ri;tag='up';msg='ارتقا به '+RAR[ri][0]+'!'}
 else{S.coins+=100;tag='dup';msg='تکراری · +۱۰۰ سکه'}
 return{k,ri,tag,msg}}

const whShort=ri=>RAR[ri][0].split(' ').pop();
const whCard=(k,ri,real)=>{const u=gunIcon(k,real?ri:0);return '<div class="wc" style="--rc:'+hx(RAR[ri][1])+'">'+(u?'<img alt="" src="'+u+'">':'')+'<b>'+WP[k].n+'</b><small>'+whShort(ri)+'</small></div>'};
// 48 cards; the prize sits at a fixed position (WH_WIN). Other cards are random weapons with rarities drawn from this wheel's odds.
function whStrip(c,prize){const ks=c.pool||Object.keys(WP);let h='';
 for(let i=0;i<WH_N;i++)h+=prize&&i==WH_WIN?whCard(prize.k,prize.ri,1):whCard(ks[Math.random()*ks.length|0],whRoll(c),0);
 return h}

function wheelHTML(){
 return '<div class="wh"><div class="whv" id="whv" dir="ltr"><i class="whp" aria-hidden="true"></i><div class="whs" id="whs"></div></div>'+
  '<div class="whr" id="whr" role="status" aria-live="polite"><small>گردونه را بچرخان؛ اسلحه‌ی برنده همین‌جا نشان داده می‌شود</small></div><div id="whc"></div></div>'}
function whCtl(){const e=$('whc');if(!e)return;const c=WH[whSel],poor=S.es<c.p;
 e.innerHTML='<div class="chips">'+WH.map((w,i)=>'<button class="'+(i==whSel?'on':'')+'" '+(whBusy?'disabled':'')+' onclick="whPick('+i+')">'+w.n+'</button>').join('')+'</div>'+
  '<p class="who">'+c.od.map((o,i)=>o?'<span style="color:'+hx(RAR[i][1])+'">'+whShort(i)+' '+o+'٪</span>':'').filter(Boolean).join(' · ')+'</p>'+
  '<button class="m" '+(whBusy||poor?'disabled':'')+' onclick="whSpin()">'+(poor?'ES کافی نیست · ':'چرخاندن · ')+c.p+' '+ICO.ES+'</button>'+(poor?bt('کسب ES از مأموریت‌ها',"view('ms')",'g'):'')+bt('خرید اسلحه (لوداوت)',"view('arm')",'g')}
function whBal(){const a=document.querySelector('.tb .cu b'),b=document.querySelector('.tb .cu.es b');if(a)a.textContent=S.coins;if(b)b.textContent=S.es}
function wheelInit(){const s=$('whs'),v=$('whv');if(!s||!v)return;s.innerHTML=whStrip(WH[whSel]);
 s.style.transition='none';s.style.transform='translateX('+(v.clientWidth/2-(4*WH_STEP+WH_CW/2))+'px)';whCtl()}
function whPick(i){if(whBusy)return;whSel=i;const r=$('whr');if(r){r.classList.remove('on');r.innerHTML='<small>گردونه را بچرخان؛ اسلحه‌ی برنده همین‌جا نشان داده می‌شود</small>'}wheelInit()}
function whSpin(){if(whBusy)return;const c=WH[whSel],s=$('whs'),v=$('whv');if(!s||!v)return;
 if(S.es<c.p){toast('ES کافی نیست');return}
 S.es-=c.p;const pr=whDraw(c);save();whBal();whBusy=1;whCtl();
 const r0=$('whr');if(r0){r0.classList.remove('on');r0.innerHTML='<small>در حال چرخش...</small>'}
 s.innerHTML=whStrip(c,pr);
 const vw=v.clientWidth,fin=vw/2-(WH_WIN*WH_STEP+WH_CW/2)+(Math.random()*.6-.3)*WH_CW,
  dur=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches?.05:5;
 s.style.transition='none';s.style.transform='translateX('+(vw/2-WH_CW/2)+'px)';void s.offsetWidth;
 s.style.transition='transform '+dur+'s cubic-bezier(.08,.6,.12,1)';s.style.transform='translateX('+fin+'px)';
 let last=-1,over=0;
 const end=()=>{if(over)return;over=1;whBusy=0;whBal();const r=$('whr');
  if(r){const u=gunIcon(pr.k,pr.ri),col=hx(RAR[pr.ri][1]);r.style.setProperty('--rc',col);r.classList.add('on');
   r.innerHTML=(u?'<img alt="" src="'+u+'">':'')+'<div><b>'+WP[pr.k].n+'</b><br><span style="color:'+col+'">'+RAR[pr.ri][0]+'</span><br><small>'+pr.msg+'</small></div>';snd(880,.18,'sine',.06)}
  whCtl()};
 const tick=()=>{if(over||!document.body.contains(s))return;const m=getComputedStyle(s).transform,x=m&&m!='none'?parseFloat(m.split(',')[4]):0,i=Math.floor((vw/2-x)/WH_STEP);if(i!=last){last=i;snd(520+(i%5)*40,.03,'square',.025)}requestAnimationFrame(tick)};
 requestAnimationFrame(tick);s.addEventListener('transitionend',end,{once:true});setTimeout(end,dur*1000+400)}
