// ===== game.js : player, bots, combat, match flow, input, update loop =====
// ---------- entities ----------
const P={x:0,z:0,y:0,vy:0,vx:0,vz:0,sl:0,ch:1.7,hp:100,dead:false,rs:0,team:0,kills:0,name:'You',ammo:0,res:Infinity,ar:0,cd:0,rl:0,lastHit:0,flash:0},bots=[];
let yaw=0,pitch=0,state='lobby',T=0,score={},ads=0,fire=0,fireEdge=0,jx=0,jy=0,jumpReq=0,slideReq=0,vmK=0,tm=0,heat=0,goal=0,vm,fl;
const aimK=()=>ads?S.set.ad/10*clamp(cam.fov/60,.3,1.2):1;
const NAMES=['xShadow','Kira_77','NoScope','Vortex','Reza.GG','Blaze','Sniper_Ali','Ghost','Mahan','Hunter','Zed','Nima_pro','Storm','Viper','Aras','Dara'];
function buildVM(){if(vm){cam.remove(vm);disposeTree(vm,1)}vm=gunModel(S.sel,S.owned[S.sel]||0);fl=new THREE.Mesh(new THREE.PlaneGeometry(.3,.3),new THREE.MeshBasicMaterial({color:0xffc060,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));fl.position.set(0,.01,vm.userData.mz-.08);fl.visible=false;vm.add(fl);vm.position.set(.18,-.2,-.42);cam.add(vm)}
function spawnAt(e){let p;for(let i=0;i<20;i++){p=spawns[Math.random()*spawns.length|0];if(![P,...bots].some(o=>o!==e&&!o.dead&&Math.hypot(o.x-p[0],o.z-p[1])<14))break}e.x=p[0];e.z=p[1]}
function startMatch(){fs();const md=S.mode,L=LV[S.cl];P.keep=S.sel;P.am={};P.slots=md>2?['pi',null]:[(S.lo[0]&&S.owned[S.lo[0]]!==undefined)?S.lo[0]:S.sel,(S.lo[1]&&S.owned[S.lo[1]]!==undefined)?S.lo[1]:null];S.sel=P.slots[0];freeLoot();S.map=md==2?L.map:S.map;build(S.map);for(const b of bots){sc.remove(b.m);disposeTree(b.m);if(b.lb){sc.remove(b.lb);disposeTree(b.lb,1)}}bots.length=0;
 P.team=0;P.kills=0;P.name=S.name;P.hp=100;P.dead=false;P.y=P.vx=P.vz=P.sl=0;const df=DF[S.set.diff];
 const list=md>2?Array.from({length:99},(_,i)=>({team:md==3?i+1:(i<3?0:1+((i-3)/4|0)),sk:rr(.3,.85)*df})):md==2?Array.from({length:L.n},()=>({team:1,sk:L.sk*df})):Array.from({length:7},(_,i)=>({team:md?(i<3?0:1):i+1,sk:rr(.35,.9)*df}));
 list.forEach((d,i)=>{const b={id:i,team:d.team,name:NAMES[(i*2+(Math.random()*2|0))%NAMES.length]+(Math.random()<.4?(Math.random()*99|0):''),x:0,z:0,hp:100,dead:false,rs:0,kills:0,yaw:0,sk:clamp(d.sk,.2,1.5),react:rr(.25,.6)/clamp(d.sk+.3,.5,2),seen:0,cd:0,wa:0,wt:0,t:0,m:md>2?mkBotL(d.team):mkBot(d.team)};spawnAt(b);bots.push(b)});
 if(md>2){const LD_={};bots.forEach(b=>{b.fall=1;b.m.visible=false;b.ft=rr(2,24);b.mate=md==4&&b.team==0;b.ox=rr(-6,6);b.oz=rr(-6,6);if(md==4&&b.team>0){const l=LD_[b.team];if(!l)LD_[b.team]=b;else{b.x=l.x+rr(-5,5);b.z=l.z+rr(-5,5);fixPos(b)}}if(b.mate){b.lb=mkLabel(b.name);sc.add(b.lb)}})}else if(md==1)bots.forEach(b=>{if(b.team==0){b.lb=mkLabel(b.name);sc.add(b.lb)}});
 spawnAt(P);ads=0;yaw=0;pitch=0;P.ammo=mg(S.sel);P.rl=0;P.res=md>2?120:Infinity;P.ar=0;T=md>2?1200:md==2?180:150;goal=md==2?L.goal:0;score={0:0};for(const b of bots)score[b.team]=score[b.team]||0;
 buildVM();if(md>2){zoneInit();planeInit();P.fly=1;yaw=Math.atan2(-PL.dx,-PL.dz);pitch=-.45;spawnLoot()}else{P.fly=0;if(ZM)ZM.visible=false;if(PL)PL.m.visible=false;for(const l of loot)sc.remove(l.m);loot.length=0}$('tmh').innerHTML='';state='play';$('menu').style.display='none';for(const e of document.querySelectorAll('.hud,.b'))e.style.display='block';$('base').style.display='none';$('feed').innerHTML='';say(md>2?'پرش = پریدن از هواپیما 🪂':md==2?'مرحله '+(S.cl+1)+': '+goal+' حذف لازم است':'نبرد شروع شد!',md>2?5000:2000)}
function say(t,ms){const m=$('msg');m.textContent=t;m.style.opacity=t?1:0;clearTimeout(say.t);if(ms)say.t=setTimeout(()=>m.style.opacity=0,ms)}
function feed(t){const f=$('feed');f.innerHTML=t+'<br>'+f.innerHTML.split('<br>').slice(0,4).join('<br>')}
const tr=[],sp=[];for(let i=0;i<14;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(.25,.25),new THREE.MeshBasicMaterial({color:0xffc070,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));m.visible=false;sc.add(m);sp.push({m,t:0})}
function spark(p){const s=sp.find(e=>e.t<=0)||sp[0];s.t=.15;s.m.position.copy(p);s.m.visible=true;s.m.lookAt(cam.position)}
function tracer(a,b){const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]),new THREE.LineBasicMaterial({color:0xffe08a}));sc.add(l);tr.push({l,t:.06})}

// ---------- combat ----------
function kill(v,att_){v.dead=true;v.rs=3;if(v.m)v.m.visible=false;score[att_.team]=(score[att_.team]||0)+1;att_.kills++;feed('<b>'+att_.name+'</b> ⟵ '+v.name);if(att_===P){snd(500,.15,'sine',.08);const ri=S.owned[S.sel]||0;say(ri>2?(ri>3?'☠ MYTHIC ':'⭐ LEGENDARY ')+v.name:'حذف '+v.name,900);killFx(v.x,v.z,ri)}if(v===P)say('کشته شدی! بازگشت تا ۳ ثانیه',2800)}
// armor absorbs 60% of damage from players/bots (not from the zone, team -1) until it runs out
function hurtP(d,a){if(P.dead||P.fly||state!='play')return;if(P.ar>0&&a.team!==-1){const x=Math.min(P.ar,d*.6);P.ar-=x;d-=x}P.hp-=d;P.lastHit=tm;$('vg').style.opacity=1;if(P.hp<=0){P.hp=0;kill(P,a)}}
function hurtB(b,d,a,head){b.hp-=d;if(a===P){$('hm').style.opacity=1;$('hm').style.borderColor=head?'#ffd400':'#ff3b3b';setTimeout(()=>$('hm').style.opacity=0,120);snd(head?1300:900,.05,'sine',.05)}if(b.hp<=0&&!b.dead)kill(b,a)}
function shoot(){const w=WP[S.sel],a=att(S.sel),rc=(a.mz==2?.7:1)*(a.gr==1?.75:1);P.ammo--;P.cd=w.rof;heat=Math.min(1,heat+.15);snd(rr(90,140),.09,'sawtooth',a.mz==1?.03:.09);vmK=.06+(w.t=='sn'?.1:0);P.flash=a.mz==1?.02:.05;pitch+=(w.pel>1?.03:w.t=='sn'?.05:.008)*rc;yaw+=rr(-.004,.004)*rc;
 const base=new THREE.Vector3();cam.getWorldDirection(base);const o=cam.position,mv=Math.hypot(P.vx,P.vz)>2?1.5:1;
 for(let p=0;p<w.pel;p++){const s=w.sp*(ads?.35:1)*(1+heat)*mv*(a.gr==2?.8:1),d=base.clone().add(new THREE.Vector3(rr(-s,s),rr(-s,s),rr(-s,s))).normalize();let bt_=wallT(o,d),hit=null,hd=false;
  for(const b of bots){if(b.dead||b.fall||b.team==P.team)continue;let t=rsph(o,d,[b.x,1.78,b.z],.27),h=true;for(const y of[1.3,.85,.35]){const t2=rsph(o,d,[b.x,y,b.z],.38);if(t2<t){t=t2;h=false}}if(t<bt_){bt_=t;hit=b;hd=h}}
  if(hit)hurtB(hit,w.dmg*(hd?2:1),P,hd);else if(bt_<150)spark(o.clone().add(d.clone().multiplyScalar(bt_-.05)));
  if(p==0&&w.pel==1)tracer(o.clone().add(new THREE.Vector3(Math.cos(yaw)*.2-Math.sin(yaw)*.9,-.15,-Math.sin(yaw)*.2-Math.cos(yaw)*.9)),o.clone().add(d.clone().multiplyScalar(Math.min(bt_,70))))}
 if(P.ammo<=0)reload()}
// reload takes bullets from the reserve (P.res); outside battle royale the reserve is Infinity
function reload(){const w=WP[S.sel];if(P.rl>0||P.ammo==mg(S.sel))return;if(P.res<=0){say('مهمات تمام شد!',1200);return}P.rl=w.rl*(att(S.sel).mg?1.15:1);say('ریلود...',0)}
function bmove(b,dx,dz,s){const l=Math.hypot(dx,dz)||1;dx=dx/l*s;dz=dz/l*s;let m=false;if(!col(b.x+dx,b.z,.5)){b.x+=dx;m=true}if(!col(b.x,b.z+dz,.5)){b.z+=dz;m=true}return m}
function botAI(b,dt){if(b.dead){if(S.mode>2)return;b.rs-=dt;if(b.rs<=0){b.dead=false;b.hp=100;spawnAt(b);b.m.visible=true}return}
 if(b.fall){if(b.fall==1){if(b.mate){if(P.fly!=1){b.x=P.x+b.ox;b.z=P.z+b.oz;b.fy=P.y;b.fall=2}else return}else{b.ft-=dt;if(b.ft<=0){b.fall=2;b.fy=110}else return}}
 b.fy-=(b.fy>30?50:12)*dt;if(b.mate){b.x+=(P.x+b.ox-b.x)*dt;b.z+=(P.z+b.oz-b.z)*dt}b.m.visible=true;b.m.position.set(b.x,b.fy,b.z);if(b.fy<=0){b.fall=0;fixPos(b)}return}
 let tg=null,td=55;b.th=(b.th||0)-dt;const think=S.mode<3||b.th<=0;if(think)b.th=rr(.15,.35);const c=[];if(think){if(!P.dead&&!P.fly&&P.team!=b.team)c.push(P);for(const o of bots)if(o!==b&&!o.dead&&!o.fall&&o.team!=b.team&&(S.mode<3||(Math.abs(o.x-b.x)<55&&Math.abs(o.z-b.z)<55)))c.push(o)}else{tg=b.tg&&!b.tg.dead?b.tg:null;if(tg)td=Math.hypot(tg.x-b.x,tg.z-b.z)}
 for(const e of c){const d=Math.hypot(e.x-b.x,e.z-b.z);if(d<td&&los(b.x,1.6,b.z,e.x,e===P?1.4:1.3,e.z)){td=d;tg=e}}if(think)b.tg=tg;
 let mv=false;
 if(tg){b.seen+=dt;const want=Math.atan2(-(tg.x-b.x),-(tg.z-b.z));b.yaw=aLerp(b.yaw,want,Math.min(1,dt*(2+b.sk*3)));const f=[-Math.sin(b.yaw),-Math.cos(b.yaw)],st=Math.sin(tm*1.4+b.id*2)*.9;let mx=-f[1]*st,mz=f[0]*st;if(td>16){mx+=f[0];mz+=f[1]}else if(td<7){mx-=f[0];mz-=f[1]}
  mv=bmove(b,mx,mz,3.8*dt);b.cd-=dt;const ang=Math.abs(((want-b.yaw+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI);
  if(b.seen>b.react&&b.cd<=0&&ang<.3){b.cd=rr(.13,.3);const pr=clamp(.6-td*.012,.08,.5)*(.4+b.sk*.6);if(S.mode<3||Math.hypot(b.x-P.x,b.z-P.z)<60)tracer(new THREE.Vector3(b.x,1.25,b.z),new THREE.Vector3(tg.x,1.4,tg.z));if(td<30)snd(rr(100,150),.06,'sawtooth',clamp(.05-td*.0012,.005,.05));
   if(Math.random()<pr){const dd=9*DD[S.set.diff];if(tg===P)hurtP(dd,b);else hurtB(tg,dd,b,false)}}
 }else{b.seen=0;b.wt-=dt;if(b.wt<=0){b.wa=rr(0,6.28);b.wt=rr(2,5)}if(S.mode==4){const Ld=b.team==0?P:bots.find(o=>o.team==b.team&&!o.dead&&!o.fall);if(Ld&&Ld!==b&&!Ld.dead&&Math.hypot(Ld.x-b.x,Ld.z-b.z)>12){b.wa=Math.atan2(-(Ld.x-b.x),-(Ld.z-b.z));b.wt=.6}}if(S.mode>2&&Math.hypot(b.x-ZN.x,b.z-ZN.z)>ZN.r*.85){b.wa=Math.atan2(-(ZN.x-b.x),-(ZN.z-b.z));b.wt=1}b.yaw=aLerp(b.yaw,b.wa,dt*3);mv=bmove(b,-Math.sin(b.wa),-Math.cos(b.wa),3.2*dt);if(!mv)b.wt=0}
 b.t+=mv?dt*9:0;const sw=mv?Math.sin(b.t)*.7:0;b.m.userData.l.rotation.x=sw;b.m.userData.r.rotation.x=-sw;b.m.position.set(b.x,0,b.z);b.m.rotation.y=b.yaw;if(S.mode>2)b.m.visible=Math.hypot(b.x-P.x,b.z-P.z)<120}
function endMatch(){if(state!='play')return;state='lobby';if(P.keep)S.sel=P.keep;P.fly=0;CNP.visible=false;freeLoot();if(PL)PL.m.visible=false;for(const e of document.querySelectorAll('.hud,.b'))e.style.display='none';
 const md=S.mode;let win,a,bb;if(md>2){win=!P.dead&&aliveTeams()<=1;a=P.kills;bb=aliveN()}else if(md==1){a=score[0]||0;bb=score[1]||0;win=a>bb}else if(md==2){a=P.kills;bb=goal;win=P.kills>=goal;if(win)S.camp=Math.max(S.camp,S.cl+1)}else{const mx=Math.max(...bots.map(x=>x.kills));win=P.kills>=mx;a=P.kills;bb=mx}
 const f=md>2?(win?3:1+(99-bb)/60):md==2?1+S.cl*.3:1,xp=Math.round((P.kills*40+(win?150:30))*f),co=Math.round((P.kills*8+(win?100:20))*f),up=addXP(xp);S.coins+=co;S.kills+=P.kills;if(win)S.wins++;save();
 const rows=[P,...bots].sort((x,y)=>y.kills-x.kills).slice(0,8).map(e=>'<div class="row"><span>'+e.name+'</span><b>'+e.kills+'</b></div>').join('');
 $('menu').style.display='flex';$('mv').className='card nar';$('mv').innerHTML='<h1>'+(win?'پیروزی!':'شکست')+'</h1><p>'+(md>2?(win?'برنده بتل رویال! 🏆':'رتبه '+(bb+1)+' از ۱۰۰')+' · کیل '+a:md==1?'تیم شما '+a+' — دشمن '+bb:md==2?'حذف: '+a+' از '+bb:'کیل شما '+a)+'<br>+'+xp+' XP · +'+co+' سکه'+(up?'<br>🎉 لول آپ! به لول '+S.lv+' رسیدی':'')+(md==2&&win&&S.camp>S.cl&&S.cl<LV.length-1?'<br>مرحله بعد باز شد':'')+'</p>'+rows+'<button class="m" onclick="view(\'main\')">بازگشت به لابی</button>'}

// ---------- input ----------
const keys={};let sid=null,so=null,lid=null,lp=null;
addEventListener('keydown',e=>{keys[e.code]=1;if(e.code=='Space')jumpReq=1;if(e.code=='KeyC'||e.code=='ControlLeft')slideReq=1;if(e.code=='KeyR')reload();if(e.code=='KeyQ')swapW();if(e.code=='KeyE')pickup()});addEventListener('keyup',e=>keys[e.code]=0);
addEventListener('touchstart',e=>{if(state!='play')return;for(const t of e.changedTouches){if(t.target.closest&&t.target.closest('.b,#mm,#ammo'))continue;if(sid===null&&t.clientX<innerWidth*.45&&t.clientY>innerHeight*.3){sid=t.identifier;so=[t.clientX,t.clientY];$('base').style.cssText='display:block;left:'+(so[0]-50)+'px;top:'+(so[1]-50)+'px'}else if(lid===null){lid=t.identifier;lp=[t.clientX,t.clientY]}}},{passive:false});
addEventListener('touchmove',e=>{if(state!='play')return;e.preventDefault();for(const t of e.changedTouches){if(t.identifier===sid){let dx=t.clientX-so[0],dy=t.clientY-so[1];const m=Math.hypot(dx,dy),k=Math.min(m,50)/(m||1);dx*=k;dy*=k;jx=dx/50;jy=-dy/50;$('knob').style.transform='translate('+dx+'px,'+dy+'px)'}else if(t.identifier===lid){const s=aimK()*S.set.sens/5;yaw-=(t.clientX-lp[0])*.0045*s;pitch=clamp(pitch-(t.clientY-lp[1])*.004*s,-1.4,1.4);lp=[t.clientX,t.clientY]}}},{passive:false});
const te=e=>{for(const t of e.changedTouches){if(t.identifier===sid){sid=null;jx=jy=0;$('base').style.display='none';$('knob').style.transform=''}if(t.identifier===lid)lid=null}};addEventListener('touchend',te);addEventListener('touchcancel',te);
let md_=false;$('c').addEventListener('mousedown',e=>{md_=true;if(e.button==0){fire=1;fireEdge=1}});addEventListener('mouseup',()=>{md_=false;fire=0});addEventListener('mousemove',e=>{if(md_&&state=='play'){yaw-=e.movementX*.004;pitch=clamp(pitch-e.movementY*.004,-1.4,1.4)}});
// fire button: hold to shoot, drag to aim (drag down = look down)
const bF=$('bF');let fp=null;
bF.onpointerdown=e=>{if(state!='play')return;fire=1;fireEdge=1;fp=[e.clientX,e.clientY,e.pointerId];try{bF.setPointerCapture(e.pointerId)}catch(x){}};
bF.onpointermove=e=>{if(!fp||e.pointerId!=fp[2]||state!='play')return;const s=aimK()*S.set.sens/5;yaw-=(e.clientX-fp[0])*.0045*s;pitch=clamp(pitch-(e.clientY-fp[1])*.004*s,-1.4,1.4);fp[0]=e.clientX;fp[1]=e.clientY};
bF.onpointerup=bF.onpointercancel=()=>{fire=0;fp=null};
const G=f=>()=>{if(state=='play')f()};
$('bJ').onpointerdown=G(()=>jumpReq=1);$('bS').onpointerdown=G(()=>slideReq=1);$('bR').onpointerdown=G(reload);$('bA').onpointerdown=G(()=>ads=1-ads);
$('bW').onpointerdown=G(pickup);$('ammo').onpointerdown=G(swapW);$('mm').onpointerdown=()=>$('mm').classList.toggle('big');$('bX').onpointerdown=endMatch;
// HUD layout editor
const BT=[...document.querySelectorAll('.b')],OS={};BT.forEach(b=>OS[b.id]=b.style.cssText);let ed=0,dg=null;
function applyLay(){const L=S.set.lay||{};BT.forEach(b=>{const d=b.style.display,p=L[b.id];b.style.cssText=OS[b.id];if(p){b.style.right=b.style.bottom='auto';b.style.left=p[0]+'vw';b.style.top=p[1]+'vh'}b.style.transformOrigin=p||b.id=='bX'?'0 0':'100% 100%';b.style.transform='scale('+(S.set.bs||1)+')';b.style.display=d})}
function editHud(){ed=1;$('menu').style.display='none';BT.forEach(b=>b.style.display='block');$('ed').style.display='flex';$('bsz').value=S.set.bs||1}
function endEdit(){ed=0;save();BT.forEach(b=>b.style.display='none');$('ed').style.display='none';view('set')}
BT.forEach(b=>b.addEventListener('pointerdown',e=>{if(!ed)return;const r=b.getBoundingClientRect();dg=[b,e.clientX-r.left,e.clientY-r.top];try{b.setPointerCapture(e.pointerId)}catch(x){}}));
addEventListener('pointermove',e=>{if(!dg||!ed)return;S.set.lay=S.set.lay||{};S.set.lay[dg[0].id]=[clamp((e.clientX-dg[1])/innerWidth*100,0,95),clamp((e.clientY-dg[2])/innerHeight*100,0,92)];applyLay()});addEventListener('pointerup',()=>dg=null);

// ---------- update ----------
function update(dt){tm+=dt;T-=dt;if(S.mode>2)brTick(dt);if(T<=0||(goal&&P.kills>=goal)||(S.mode>2&&aliveTeams()<=1))return endMatch();
 if(P.dead){P.rs-=dt;if(S.mode>2&&P.rs<=0)return endMatch();if(S.mode<3&&P.rs<=0){P.dead=false;P.hp=100;spawnAt(P);P.ammo=mg(S.sel);P.y=P.vx=P.vz=P.sl=0;say('')}}
 const w=WP[S.sel];let sprint=false;
 if(P.fly)airTick(dt);if(!P.dead&&!P.fly){const ix=clamp(jx+(keys.KeyD?1:0)-(keys.KeyA?1:0),-1,1),iy=clamp(jy+(keys.KeyW?1:0)-(keys.KeyS?1:0),-1,1),fl0=flo(P.x,P.z,P.y),gr=P.y<=fl0+.02,fx=-Math.sin(yaw),fz=-Math.cos(yaw);
  let mx=fx*iy+Math.cos(yaw)*ix,mz=fz*iy-Math.sin(yaw)*ix;const l=Math.hypot(mx,mz);if(l>1){mx/=l;mz/=l}
  sprint=iy>.85&&!ads&&gr&&P.sl<=0;const spd_=ads?3:sprint?8.5:6;
  if(slideReq&&gr&&P.sl<=0&&Math.hypot(P.vx,P.vz)>4.5){const v=Math.hypot(P.vx,P.vz);P.vx=P.vx/v*16;P.vz=P.vz/v*16;P.sl=1.3;snd(180,.35,'sawtooth',.03)}slideReq=0;
  if(P.sl>0){P.sl-=dt;P.vx+=(0-P.vx)*Math.min(1,dt*1.1);P.vz+=(0-P.vz)*Math.min(1,dt*1.1)}else{const k=gr?11:3.5;P.vx+=(mx*spd_-P.vx)*Math.min(1,dt*k);P.vz+=(mz*spd_-P.vz)*Math.min(1,dt*k)}
  if(jumpReq&&gr){P.vy=8.5;P.sl=0;P.jc=1;snd(260,.12,'sine',.04)}else if(jumpReq&&!gr&&P.jc==1){P.vy=7.5;P.jc=2}jumpReq=0;
  const nx=P.x+P.vx*dt;if(!col(nx,P.z,.45,P.y))P.x=nx;else P.vx=0;const nz=P.z+P.vz*dt;if(!col(P.x,nz,.45,P.y))P.z=nz;else P.vz=0;
  P.vy-=16*dt;P.y=Math.max(fl0,P.y+P.vy*dt);if(P.y<=fl0&&P.vy<0){P.vy=0;P.jc=0}
  P.cd-=dt;heat=Math.max(0,heat-dt*.8);if(P.rl>0){P.rl-=dt;if(P.rl<=0){const t=Math.min(mg(S.sel)-P.ammo,P.res);P.ammo+=t;P.res-=t;say('')}}
  if(fire&&P.ammo>0&&P.rl<=0&&P.cd<=0&&(w.auto||fireEdge)&&!sprint)shoot();fireEdge=0;
  if(tm-P.lastHit>5&&P.hp<100)P.hp=Math.min(100,P.hp+25*dt);
  const spd=Math.hypot(P.vx,P.vz),bob=gr&&P.sl<=0&&spd>.5?Math.sin(tm*(sprint?13:9))*.012*(spd/6):0;
  vm.position.set(ads?0:.18,(ads?-.14:-.2)+bob+(sprint?-.04:0),(ads?-.36:-.42)+vmK);vm.rotation.set(sprint?.35:0,sprint?-.3:0,P.sl>0?.25:0);vmK*=.8;
  P.flash-=dt;fl.visible=P.flash>0;fl.rotation.z=Math.random()*6}
 if(S.mode>2)planeTick(dt);for(const b of bots)botAI(b,dt);
 for(const b of bots)if(b.lb){b.lb.visible=!b.dead&&b.fall!=1;b.lb.position.set(b.x,(b.fall==2?b.fy:0)+2.3,b.z)}
 if(S.mode>2){nearL=null;let nd=3.2;for(const l of loot){const d=Math.hypot(l.x-P.x,l.z-P.z),v=d<55;l.m.visible=v;if(v){l.m.rotation.y+=dt*1.2;l.m.position.y=.9+Math.sin(tm*2+l.x)*.08;if(!P.fly&&!P.dead&&d<nd){nd=d;nearL=l}}}const bw=$('bW');bw.style.display=nearL?'block':'none';if(nearL){const tt='برداشتن '+(WP[nearL.k]||ITM[nearL.k]).n;if(bw.textContent!=tt)bw.textContent=tt}}else $('bW').style.display='none';
 const tch=P.sl>0?1.0:1.7;P.ch+=(tch-P.ch)*Math.min(1,dt*12);
 const shk=P.fly==2&&!P.chute?.05:0;cam.position.set(P.x+rr(-shk,shk),P.ch+P.y-(P.dead?1.2:0)+rr(-shk,shk),P.z);cam.rotation.set(pitch,yaw,P.dead?.5:P.sl>0?-.06:P.fly==2?Math.sin(tm*(P.chute?2:7))*(P.chute?.06:.03):0,'YXZ');
 const lz=att(S.sel).gr==2&&!P.dead;LS.visible=LD.visible=lz;if(lz){const d=new THREE.Vector3();cam.getWorldDirection(d);const o=cam.position;let t=Math.min(wallT(o,d),90);for(const b of bots)if(!b.dead&&b.team!=P.team){const q=rsph(o,d,[b.x,1.3,b.z],.5);if(q<t)t=q}
  const st=o.clone().add(new THREE.Vector3(Math.cos(yaw)*(ads?0:.18)-Math.sin(yaw)*.5,ads?-.12:-.17,-Math.sin(yaw)*(ads?0:.18)-Math.cos(yaw)*.5)),en=o.clone().add(d.clone().multiplyScalar(t));LS.position.copy(st);LS.lookAt(en);LS.scale.z=st.distanceTo(en);LD.position.copy(en);LD.scale.setScalar(.6+t*.05);LD.visible=t<89}
 const tf=ads?zm():S.set.fov+(sprint?5:0)+(P.fly==2&&!P.chute?25:0)+(P.sl>0?8:0);cam.fov+=(tf-cam.fov)*Math.min(1,dt*10);cam.far=P.fly?500:220;sc.fog.near=P.fly?90:30;sc.fog.far=S.mode>2?(P.fly?340:170):120;$('wd').style.opacity=P.fly==2&&!P.chute?.8:0;$('wd').style.transform='rotate('+(tm*30%360)+'deg) scale(1.5)';cam.updateProjectionMatrix();vm.visible=!P.dead&&!P.fly;
 const sa=SCP[att(S.sel).sc],dot=ads&&sa.z&&!sa.ov;$('xh').style.opacity=ads&&sa.ov?0:1;$('scp').style.opacity=ads&&sa.ov?1:0;const rk=ads&&sa.ov?sa.r:'';if(rk!==lastR){lastR=rk;$('scp').innerHTML=rk?RT(rk):''}const ff=ads&&sa.r=='th'?'grayscale(1) contrast(1.5) brightness(1.15) sepia(.5) hue-rotate(70deg)':'none';if(ff!==lastF){lastF=ff;$('c').style.filter=ff}$('xh').style.background=dot?(sa.r=='ho'?'radial-gradient(#4f8 0 10%,#0000 12% 60%,#4f8 62% 70%,#0000 72%)':'radial-gradient(#f22 28%,#0000 32%)'):'none';$('xh').style.borderColor=dot?'transparent':'#fffc';
 sky.position.copy(cam.position);dl.position.set(P.x+30,55,P.z+20);dl.target.position.set(P.x,0,P.z);
 for(let i=tr.length-1;i>=0;i--){tr[i].t-=dt;if(tr[i].t<=0){sc.remove(tr[i].l);tr[i].l.geometry.dispose();tr[i].l.material.dispose();tr.splice(i,1)}}
 for(let i=FXP.length-1;i>=0;i--){const f=FXP[i],m=f.m;f.t-=dt*(f.pil?1.5:1);if(f.v){m.position.x+=f.v[0]*dt;m.position.y+=f.v[1]*dt;m.position.z+=f.v[2]*dt;f.v[1]-=9*dt;m.lookAt(cam.position)}if(f.ring)m.scale.setScalar(1+(1-f.t)*14);m.material.opacity=Math.max(0,f.t);if(f.t<=0){sc.remove(m);m.geometry.dispose();m.material.dispose();FXP.splice(i,1)}}
 for(const s of sp)if(s.t>0){s.t-=dt;if(s.t<=0)s.m.visible=false}
 $('vg').style.opacity=Math.max(0,($('vg').style.opacity||0)-dt*1.5);
 if(tm-mmT>.12){mmT=tm;drawMap();if(S.mode==4||S.mode==1)teamHud()}$('hpf').style.width=P.hp+'%';$('hpf').style.background=P.hp>40?'#2ecc71':'#e74c3c';$('hpt').textContent='سلامت '+Math.ceil(P.hp)+(P.ar>0?' · آرمور '+Math.ceil(P.ar):'');$('ammo').innerHTML='<small>'+WP[S.sel].n+(P.slots&&P.slots[1]?' ⇄':'')+'</small><br>'+(P.rl>0?'...':P.ammo+' / '+(P.res===Infinity?mg(S.sel):P.res));
 const m=Math.floor(T/60),s=Math.floor(T%60),md=S.mode;$('sc').textContent=(md>2?'زنده '+aliveN()+' · کیل '+P.kills+' · منطقه '+Math.ceil(ZN.r)+'m '+(ZN.sh?'⚠ کوچک می‌شود':Math.ceil(ZN.t)+'s'):md==1?'تیم شما '+(score[0]||0)+' — دشمن '+(score[1]||0):md==2?'هدف: '+P.kills+' / '+goal:'کیل: '+P.kills+' | برترین '+Math.max(P.kills,...bots.map(b=>b.kills)))+' · '+m+':'+String(s).padStart(2,'0')}
let last=performance.now();
function loop(n){requestAnimationFrame(loop);const dt=Math.min((n-last)/1000,.05);last=n;
 if(pv)pv.visible=state!='play';
 if(state=='play'){mapG.visible=sky.visible=true;update(dt)}
 else{tm+=dt;if(!pv)pvBuild();mapG.visible=sky.visible=false;R.setClearColor(0x0a1220);for(const b of bots){b.m.visible=false;if(b.lb)b.lb.visible=false}if(vm)vm.visible=false;pv.rotation.y=Math.PI-.55+Math.sin(tm*.6)*.25;cam.position.set(0,301.1,4.6);cam.lookAt(0,300.95,0);cam.fov=36;LS.visible=LD.visible=false;if(ZM)ZM.visible=false;if(lastF!='none'){lastF='none';$('c').style.filter='none'}cam.updateProjectionMatrix();dl.position.set(4,305,6);dl.target.position.set(0,300,0)}
 R.render(sc,cam)}
