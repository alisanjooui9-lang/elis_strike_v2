// ===== models.js : 3D models, memory cleanup, battle royale, FX, plane, loot, minimap =====
function mkBot(team,col){const g=new THREE.Group(),M=(c,s)=>new THREE.MeshPhongMaterial({color:c,shininess:s||12}),tc=col!==undefined?col:[0x2e6fd1,0xd13b2e,0x2ea35a,0xd1a32e,0x8a2ed1,0x2ed1c8,0xd12e8a,0x888888][team%8],dk=M(0x1b2028,30);
 const P_=(geo,m,x,y,z)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);g.add(o);return o};
 P_(new THREE.CylinderGeometry(.27,.23,.7,10),M(tc),0,1.2,0);P_(new THREE.BoxGeometry(.6,.46,.34),dk,0,1.26,0);P_(new THREE.SphereGeometry(.16,10,8),M(0xe0b890),0,1.78,0);
 P_(new THREE.SphereGeometry(.2,10,8,0,6.3,0,1.65),dk,0,1.82,0);P_(new THREE.BoxGeometry(.28,.07,.08),M(0x111111,80),0,1.78,-.17);
 const arm=(x,rz)=>{const a=P_(new THREE.CylinderGeometry(.07,.06,.55,8).translate(0,-.28,0),M(tc),x,1.5,0);a.rotation.x=-1.2;a.rotation.z=rz};arm(-.3,.15);arm(.3,-.3);
 P_(new THREE.BoxGeometry(.08,.12,.75),dk,.18,1.2,-.5);P_(new THREE.CylinderGeometry(.015,.015,.4,6).rotateX(Math.PI/2),dk,.18,1.22,-.95);
 const leg=x=>{const l=P_(new THREE.CylinderGeometry(.11,.09,.82,8).translate(0,-.41,0),M(0x28323f),x,.84,0);const b=new THREE.Mesh(new THREE.BoxGeometry(.16,.1,.28),dk);b.position.set(0,-.8,-.04);l.add(b);return l};
 g.userData={l:leg(-.15),r:leg(.15)};g.traverse(o=>o.castShadow=true);sc.add(g);return g}
function gunModel(k,ri,a){a=a||att(k);const w=WP[k],c=COL[a.cl]||RAR[ri][1],g=new THREE.Group(),L=w.len;
 const mt=new THREE.MeshPhongMaterial({map:skinTex(a.pt,c),shininess:90,specular:0xaaaaaa,emissive:ri>2?c:0,emissiveIntensity:ri>2?.3:0}),dk=new THREE.MeshPhongMaterial({color:0x1a1d22,shininess:70,specular:0x666666});
 const bx=(a,b,d,m,x,y,z,rx)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(a,b,d),m);o.position.set(x,y,z);if(rx)o.rotation.x=rx;g.add(o);return o},cy=(r,l,m,x,y,z)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,l,12).rotateX(Math.PI/2),m);o.position.set(x,y,z);g.add(o);return o};
 bx(.07,.1,L*.5,dk,0,0,0);bx(.065,.06,L*.38,mt,0,.01,-L*.42);cy(.013,L*.42,dk,0,.012,-L*.8);cy(.02,.09,dk,0,.012,-L*1.01);
 bx(.055,.15,.09,dk,0,-.115,.02,.18);bx(.045,.12,.07,dk,0,-.1,L*.2,-.3);bx(.055,.1,L*.32,mt,0,-.015,L*.44);bx(.035,.04,.11,dk,0,.075,-.04);
 if(w.t=='sg')bx(.08,.055,.22,mt,0,-.05,-L*.4);if(w.t=='smg')bx(.05,.2,.08,dk,0,-.14,-.1,.1);if(w.t=='lmg')cy(.07,.1,dk,0,-.13,-.05);
 const q=[0,1,2,3,4,4,3,2][a.sc];if(q==1)bx(.05,.05,.1,dk,0,.1,-.1);if(q==2)bx(.06,.07,.1,dk,0,.11,-.1);if(q==3)cy(.03,.2,dk,0,.11,-.12);if(q==4){cy(.036,.32,dk,0,.12,-.14);cy(.042,.05,mt,0,.12,-.3)}
 if(a.mz==1)cy(.026,.16,dk,0,.012,-L*1.07-.06);if(a.mz==2)cy(.03,.05,dk,0,.012,-L*1.04);if(a.gr)bx(.03,.12,.04,dk,0,-.1,-L*.5);if(a.mg)bx(.045,.24,.09,dk,0,-.2,.04,.18);
 g.userData.mz=-L*1.07-(a.mz==1?.16:0);g.traverse(o=>o.frustumCulled=false);return g}
let pv;function pvBuild(){if(pv){sc.remove(pv);disposeTree(pv,1)}pv=new THREE.Group();const o=mkBot(0,OPS[S.op||0].c);sc.remove(o);for(const i of[8,7]){const c=o.children[i];o.remove(c);disposeTree(c)}const g=gunModel(S.sel,S.owned[S.sel]||0);g.scale.setScalar(1.25);g.position.set(.17,1.22,-.2);o.add(g);pv.add(o);pv.position.set(0,300,0);sc.add(pv)}

// ---------- BR, FX, laser ----------
const BG=new THREE.CylinderGeometry(.27,.23,1.4,8).translate(0,.8,0),HG=new THREE.SphereGeometry(.17,8,6).translate(0,1.78,0),GG=new THREE.BoxGeometry(.08,.1,.7).translate(.2,1.2,-.5),SKM=new THREE.MeshLambertMaterial({color:0xe0b890}),DKM=new THREE.MeshLambertMaterial({color:0x1b2028}),MC={};
// ---- v3: memory cleanup (release geometry/material/texture GPU memory) ----
// KEEP = shared resources that must never be disposed (used by every lightweight BR bot).
const KEEP=new Set([BG,HG,GG,SKM,DKM]),isKept=x=>KEEP.has(x)||Object.values(MC).includes(x);
function disposeTree(o,maps){if(!o)return;o.traverse(n=>{if(n.geometry&&!n.isSprite&&!isKept(n.geometry))n.geometry.dispose();const ms=n.material?(Array.isArray(n.material)?n.material:[n.material]):[];for(const m of ms){if(isKept(m))continue;if(maps&&m.map)m.map.dispose();m.dispose()}})}
function freeLoot(){for(const l of loot)sc.remove(l.m);loot.length=0;nearL=null;for(const k in LM)disposeTree(LM[k],1);LM={}}
function mkBotL(team){const c=MC[team]||(MC[team]=new THREE.MeshLambertMaterial({color:team==0?0x2ecc71:new THREE.Color().setHSL((team*.137)%1,.7,.5)}));const g=new THREE.Group();g.add(new THREE.Mesh(BG,c),new THREE.Mesh(HG,SKM),new THREE.Mesh(GG,DKM));g.userData={l:{rotation:{x:0}},r:{rotation:{x:0}}};sc.add(g);return g}
let ZN={x:0,z:0,r:140},ZM,lastR='',lastF='none';
function zoneInit(){ZN={x:0,z:0,r:140,tr:140,tx:0,tz:0,ox:0,oz:0,or:140,t:75,ph:0,sh:0};if(!ZM){ZM=new THREE.Mesh(new THREE.CylinderGeometry(1,1,60,48,1,true),new THREE.MeshBasicMaterial({color:0xff2020,transparent:true,opacity:.18,side:THREE.DoubleSide,depthWrite:false}));sc.add(ZM)}ZM.visible=true}
function brTick(dt){ZN.t-=dt;if(ZN.sh){const k=1-clamp(ZN.t/25,0,1);ZN.r=ZN.or+(ZN.tr-ZN.or)*k;ZN.x=ZN.ox+(ZN.tx-ZN.ox)*k;ZN.z=ZN.oz+(ZN.tz-ZN.oz)*k;if(ZN.t<=0){ZN.sh=0;ZN.t=30}}
 else if(ZN.t<=0){ZN.sh=1;ZN.t=25;ZN.ph++;ZN.or=ZN.r;ZN.ox=ZN.x;ZN.oz=ZN.z;ZN.tr=Math.max(4,ZN.r*.62);const o=(ZN.r-ZN.tr)*.7*Math.random(),a=rr(0,6.28);ZN.tx=ZN.x+Math.cos(a)*o;ZN.tz=ZN.z+Math.sin(a)*o;say('⚠ منطقه در حال کوچک شدن',2000)}
 const dm=dt*(2+ZN.ph*1.5),zk={team:-1,kills:0,name:'منطقه'};if(!P.dead&&!P.fly&&Math.hypot(P.x-ZN.x,P.z-ZN.z)>ZN.r){hurtP(dm,zk);say('⚠ خارج از منطقه',300)}
 for(const b of bots)if(!b.dead&&Math.hypot(b.x-ZN.x,b.z-ZN.z)>ZN.r){b.hp-=dm;if(b.hp<=0)kill(b,zk)}
 ZM.scale.set(ZN.r,1,ZN.r);ZM.position.set(ZN.x,30,ZN.z)}
const aliveN=()=>bots.filter(b=>!b.dead).length+(P.dead?0:1),aliveTeams=()=>{const t=new Set();if(!P.dead)t.add(P.team);for(const b of bots)if(!b.dead)t.add(b.team);return t.size};
const FXP=[];
function killFx(x,z,ri){if(ri<1)return;const col=RAR[ri][1],M=o=>new THREE.MeshBasicMaterial(Object.assign({color:col,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide},o||{}));
 for(let i=0;i<8+ri*8;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(.18,.18),M());m.position.set(x,1.3,z);sc.add(m);FXP.push({m,v:[rr(-4,4),rr(2,7),rr(-4,4)],t:1})}
 if(ri>=3){const m=new THREE.Mesh(new THREE.RingGeometry(.3,.5,32).rotateX(-Math.PI/2),M());m.position.set(x,.1,z);sc.add(m);FXP.push({m,ring:1,t:1})}
 if(ri==4){const m=new THREE.Mesh(new THREE.CylinderGeometry(.4,.4,40,12,1,true),M());m.position.set(x,20,z);sc.add(m);FXP.push({m,pil:1,t:1})}}
const LS=new THREE.Mesh(new THREE.CylinderGeometry(.004,.004,1,6).rotateX(Math.PI/2).translate(0,0,.5),new THREE.MeshBasicMaterial({color:0xff2020,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false,fog:false})),LD=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),new THREE.MeshBasicMaterial({color:0xff4040,fog:false}));LS.visible=LD.visible=false;LS.frustumCulled=false;sc.add(LS,LD);
const RT=r=>{let k='';const dots=[-16,-12,-8,8,12,16].map(d=>'<circle cx="'+(80+d)+'" cy="45" r=".4"/><circle cx="80" cy="'+(45+d)+'" r=".4"/>').join('');
 if(r=='sn')k='<g stroke="#000" stroke-width=".25"><path d="M80 9V40M80 50V81M44 45H75M85 45H116"/></g><g stroke="#000" stroke-width=".9"><path d="M80 9V22M80 68V81M44 45H57M103 45H116"/></g><g fill="#000">'+dots+'</g>';
 if(r=='ac')k='<path d="M80 45L76 53H84Z" fill="#e22"/><path d="M80 9V37M43 45H72M88 45H117" stroke="#000" stroke-width=".3"/>';
 if(r=='th')k='<circle cx="80" cy="45" r="36" fill="none" stroke="#6f6" stroke-width=".5" opacity=".6"/><g stroke="#6f6" stroke-width=".3"><path d="M80 9V38M80 52V81M44 45H73M87 45H116"/></g>';
 return '<svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice"><path fill-rule="evenodd" fill="#000" d="M0 0H160V90H0Z M80 9a36 36 0 1 0 .01 0Z"/><circle cx="80" cy="45" r="36" fill="#9cf" opacity=".05"/>'+k+'</svg>'};

// ---------- plane, loot, map ----------
let PL,loot=[],LM={},nearL=null,mmT=0,tmT=0;
function planeInit(){if(!PL){const g=new THREE.Group(),m=new THREE.MeshLambertMaterial({color:0x8a949c});g.add(new THREE.Mesh(new THREE.BoxGeometry(3,3,16),m),new THREE.Mesh(new THREE.BoxGeometry(18,.4,4),m));sc.add(g);PL={m:g}}
 const a=rr(0,6.28),sx=Math.cos(a)*130,sz=Math.sin(a)*130,ex=-sx*.9+rr(-30,30),ez=-sz*.9+rr(-30,30),L=Math.hypot(ex-sx,ez-sz);Object.assign(PL,{sx,sz,dx:(ex-sx)/L,dz:(ez-sz)/L,len:L,s:12,h:120,t:0});PL.m.visible=true;PL.m.rotation.y=Math.atan2(-PL.dx,-PL.dz)}
function planeTick(dt){if(!PL)return;PL.t+=dt;const d=PL.t*PL.s;PL.m.position.set(PL.sx+PL.dx*d,PL.h,PL.sz+PL.dz*d);PL.m.visible=d<PL.len+30}
const CNP=new THREE.Mesh(new THREE.SphereGeometry(2.2,16,8,0,6.3,0,1.35),new THREE.MeshLambertMaterial({color:0xff7a00,side:THREE.DoubleSide}));CNP.visible=false;sc.add(CNP);
function airTick(dt){if(P.fly==1){const d=PL.t*PL.s;P.x=PL.m.position.x;P.z=PL.m.position.z;P.y=PL.h-1;if(jumpReq||d>=PL.len){P.fly=2;P.chute=0;P.fs=0;P.vx=PL.dx*PL.s;P.vz=PL.dz*PL.s;jumpReq=0;pitch=-1.1;snd(120,.5,'sawtooth',.06);say('🪂 سقوط آزاد!',1200)}return}
 jumpReq=0;const ix=clamp(jx+(keys.KeyD?1:0)-(keys.KeyA?1:0),-1,1),iy=clamp(jy+(keys.KeyW?1:0)-(keys.KeyS?1:0),-1,1),fx=-Math.sin(yaw),fz=-Math.cos(yaw);
 if(!P.chute&&P.y<30){P.chute=1;P.ct=tm;P.fs=Math.max(P.fs,30);snd(300,.25,'square',.05);say('🪂 چتر باز شد!',1000)}
 const ch=P.chute,sp=ch?11:20;P.vx+=((fx*iy+Math.cos(yaw)*ix)*sp-P.vx)*Math.min(1,dt*1.5);P.vz+=((fz*iy-Math.sin(yaw)*ix)*sp-P.vz)*Math.min(1,dt*1.5);P.x=clamp(P.x+P.vx*dt,-95,95);P.z=clamp(P.z+P.vz*dt,-95,95);
 P.fs+=((ch?12:50)-P.fs)*Math.min(1,dt*(ch?3.3:2.5));P.y-=P.fs*dt;CNP.visible=!!ch;if(ch){CNP.position.set(P.x,P.y+4.4,P.z);CNP.scale.setScalar(Math.min(1,(tm-P.ct)*2.5)+.01)}
 if(P.y<=0){P.y=0;P.vy=0;P.fly=0;P.vx=P.vz=0;CNP.visible=false;fixPos(P);snd(150,.2,'sine',.06);say('فرود! اسلحه پیدا کن',1800)}else say('ارتفاع '+Math.ceil(P.y)+' متر',250)}
// ---- v3: ammo / armor pickups (battle royale only) ----
const ITM={ammo:{n:'مهمات +۶۰'},armor:{n:'آرمور +۵۰'}},MAXRES=300;
function itemModel(k){const g=new THREE.Group(),M=c=>new THREE.MeshPhongMaterial({color:c,shininess:30}),b=(w,h,d,m,x,y,z)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);g.add(o)};
 if(k=='ammo'){b(.5,.3,.34,M(0x4b5a32),0,0,0);b(.52,.06,.36,M(0xf1c40f),0,.05,0)}else{b(.46,.5,.2,M(0x2e6fd1),0,0,0);b(.3,.3,.04,M(0x1b2028),0,0,.11)}
 g.traverse(o=>o.frustumCulled=false);return g}
function addLoot(k,x,z){const g=LM[k]||(LM[k]=ITM[k]?itemModel(k):gunModel(k,S.owned[k]||0)),m=g.clone();m.scale.setScalar(ITM[k]?1.5:1.7);m.position.set(x,.9,z);sc.add(m);loot.push({k,x,z,m})}
// loot: guns, ammo and armor inside houses/high ground (lootSpots from build) plus scattered outdoors
function spawnLoot(){for(const l of loot)sc.remove(l.m);loot.length=0;const pool=[];Object.keys(WP).forEach(k=>{const w=WP[k].t=='sn'?1:WP[k].t=='lmg'||WP[k].t=='pi'?2:4;for(let i=0;i<w;i++)pool.push(k)});
 const kind=(g,a)=>{const q=Math.random();return q<g?pool[Math.random()*pool.length|0]:q<g+a?'ammo':'armor'};
 for(const s of lootSpots)addLoot(kind(.6,.25),s.x,s.z);
 for(let i=0,n=0;i<900&&n<80;i++){const x=(Math.random()-.5)*190,z=(Math.random()-.5)*190;if(!col(x,z,1.2)){addLoot(kind(.68,.22),x,z);n++}}}
function equip(k){P.am[S.sel]=P.ammo;S.sel=k;P.ammo=P.am[k]!==undefined?P.am[k]:mg(k);P.rl=0;ads=0;buildVM()}
function swapW(){if(state!='play'||P.fly||!P.slots)return;const o=P.slots.find(x=>x&&x!=S.sel);if(o)equip(o)}
function pickup(){const l=nearL;if(!l||P.fly)return;const k=l.k,sl=P.slots;
 if(ITM[k]){if(k=='ammo'){if(P.res>=MAXRES){say('مهمات پر است',800);return}P.res=Math.min(MAXRES,P.res+60)}else{if(P.ar>=100){say('آرمور کامل است',800);return}P.ar=Math.min(100,P.ar+50)}loot.splice(loot.indexOf(l),1);sc.remove(l.m);nearL=null;snd(700,.1,'sine',.06);say(ITM[k].n,800);return}
 loot.splice(loot.indexOf(l),1);sc.remove(l.m);nearL=null;if(sl.includes(k)){P.am[k]=mg(k);if(S.sel==k)P.ammo=mg(k)}else{let i=sl.indexOf(S.sel);if(sl[1]==null)i=1;else addLoot(S.sel,P.x+1.2,P.z+1.2);sl[i]=k;equip(k)}snd(700,.1,'sine',.06);say(WP[k].n,800)}
function mkLabel(t){const k=document.createElement('canvas');k.width=256;k.height=64;const g=k.getContext('2d');g.font='bold 34px Tahoma';g.textAlign='center';g.fillStyle='#2ecc71';g.strokeStyle='#000';g.lineWidth=5;g.strokeText(t,128,42);g.fillText(t,128,42);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(k),depthTest:false,transparent:true}));s.scale.set(2.4,.6,1);s.renderOrder=9;return s}
const mx=$('mm').getContext('2d');
// minimap: boxes with y0>2 (roofs, lintels, window tops) are skipped so houses show as walls with open doors
function drawMap(){const hf=S.mode>2?100:44,k=260/(2*hf),X=x=>(x+hf)*k,Y=z=>(z+hf)*k;mx.clearRect(0,0,260,260);mx.fillStyle='#1b2433';mx.fillRect(0,0,260,260);mx.fillStyle='#6b7688';for(const b of boxes){if((b.y0||0)>2)continue;mx.fillRect(X(b.x0),Y(b.z0),Math.max(1.5,(b.x1-b.x0)*k),Math.max(1.5,(b.z1-b.z0)*k))}
 if(S.mode>2){mx.strokeStyle='#f33';mx.lineWidth=3;mx.beginPath();mx.arc(X(ZN.x),Y(ZN.z),ZN.r*k,0,6.3);mx.stroke();if(ZN.sh){mx.strokeStyle='#fff';mx.lineWidth=1;mx.beginPath();mx.arc(X(ZN.tx),Y(ZN.tz),ZN.tr*k,0,6.3);mx.stroke()}mx.fillStyle='#fc3';for(const l of loot)mx.fillRect(X(l.x)-1.5,Y(l.z)-1.5,3,3);if(PL&&PL.m.visible){mx.fillStyle='#fff';mx.fillRect(X(PL.m.position.x)-4,Y(PL.m.position.z)-4,8,8)}}
 mx.fillStyle='#2ecc71';for(const b of bots)if(b.team==P.team&&!b.dead&&b.fall!=1){mx.beginPath();mx.arc(X(b.x),Y(b.z),4,0,6.3);mx.fill()}
 mx.save();mx.translate(X(P.x),Y(P.z));mx.rotate(-yaw);mx.fillStyle='#ffd400';mx.beginPath();mx.moveTo(0,-8);mx.lineTo(5,6);mx.lineTo(-5,6);mx.fill();mx.restore()}
function teamHud(){$('tmh').innerHTML='<b style="color:#2ecc71">هم‌تیمی‌ها</b><br>'+bots.filter(b=>b.team==0).map(b=>'<span style="color:'+(b.dead?'#e74c3c':'#fff')+'">'+(b.dead?'✖ ':'● ')+b.name+(b.dead?'':' <small>'+Math.ceil(b.hp)+'</small>')+'</span>').join('<br>')}
