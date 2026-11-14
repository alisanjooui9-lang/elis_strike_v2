// ===== scene.js : renderer, textures, map building, collisions =====
const Q=S.set.q,R=new THREE.WebGLRenderer({canvas:$('c'),antialias:Q>1});R.setPixelRatio([.7,1,Math.min(devicePixelRatio,1.75)][Q]);
const sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(75,1,.1,220);sc.add(cam);
sc.fog=new THREE.Fog(0xaebfcc,30,120);
const hemi=new THREE.HemisphereLight(0xdde8ff,0x555048,.9),dl=new THREE.DirectionalLight(0xfff0d8,.85);sc.add(hemi,dl,dl.target);
if(Q>0){R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;dl.castShadow=true;dl.shadow.mapSize.set(Q==2?2048:1024,Q==2?2048:1024);const c=dl.shadow.camera;c.left=c.bottom=-45;c.right=c.top=45;c.near=1;c.far=160;dl.shadow.bias=-.0006}
const sky=(function(){const k=document.createElement('canvas');k.width=2;k.height=256;const g=k.getContext('2d'),gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,'#2a64aa');gr.addColorStop(.48,'#9cc4e8');gr.addColorStop(.52,'#dfe7ec');gr.addColorStop(1,'#8a9399');g.fillStyle=gr;g.fillRect(0,0,2,256);const m=new THREE.Mesh(new THREE.SphereGeometry(160,16,12),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(k),side:THREE.BackSide,fog:false}));sc.add(m);return m})();
function resize(){R.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}addEventListener('resize',resize);resize();
const TC={};function tex(t,c,rx,ry){const key=t+c+rx+ry;if(TC[key])return TC[key];const k=document.createElement('canvas');k.width=k.height=128;const g=k.getContext('2d');g.fillStyle=c;g.fillRect(0,0,128,128);
 for(let i=0;i<900;i++){g.fillStyle='rgba('+(Math.random()<.5?'0,0,0':'255,255,255')+','+Math.random()*.1+')';g.fillRect(Math.random()*128,Math.random()*128,2,2)}
 if(t=='win'){for(let y=0;y<4;y++)for(let x=0;x<4;x++){g.fillStyle=Math.random()<.25?'#e8d9a0':'#1a2430';g.fillRect(x*32+7,y*32+6,18,20)}}
 else if(t=='brick'){g.strokeStyle='rgba(0,0,0,.35)';for(let y=0;y<8;y++){g.strokeRect(0,y*16,128,16);for(let x=(y%2)*16;x<128;x+=32)g.strokeRect(x,y*16,32,16)}}
 else if(t=='rib'){g.fillStyle='rgba(0,0,0,.3)';for(let x=0;x<128;x+=16)g.fillRect(x,0,5,128)}
 else if(t=='crate'){g.strokeStyle='rgba(0,0,0,.55)';g.lineWidth=7;g.strokeRect(3,3,122,122);g.beginPath();g.moveTo(0,0);g.lineTo(128,128);g.moveTo(128,0);g.lineTo(0,128);g.stroke()}
 else if(t=='bag'){g.strokeStyle='rgba(0,0,0,.3)';for(let y=0;y<4;y++)g.strokeRect(0,y*32,128,32)}
 const x=new THREE.CanvasTexture(k);x.wrapS=x.wrapT=THREE.RepeatWrapping;x.repeat.set(rx||1,ry||1);return TC[key]=x}
function skinTex(p,c){const k=document.createElement('canvas');k.width=k.height=64;const g=k.getContext('2d');g.fillStyle=hx(c);g.fillRect(0,0,64,64);g.fillStyle='rgba(0,0,0,.35)';
 if(p==1)for(let i=0;i<26;i++){g.beginPath();g.arc(rr(0,64),rr(0,64),rr(3,9),0,6.3);g.fill()}
 if(p==2)for(let i=0;i<8;i++)g.fillRect(i*8,0,3,64);
 if(p==3)for(let i=0;i<90;i++)g.fillRect((rr(0,64)|0)&~3,(rr(0,64)|0)&~3,8,4);
 if(p==4){g.fillStyle='rgba(255,255,255,.25)';for(let i=0;i<64;i+=6)g.fillRect(0,i,64,2)}
 if(p==5){g.strokeStyle='rgba(0,0,0,.5)';for(let y=0;y<64;y+=10)for(let x=(y/10%2)*6;x<64;x+=12)g.strokeRect(x,y,6,8)}
 if(p==6){g.strokeStyle='rgba(0,0,0,.55)';g.lineWidth=4;for(let i=-64;i<64;i+=11){g.beginPath();g.moveTo(i,0);g.lineTo(i+40,64);g.stroke()}}
 if(p==7){g.fillStyle='rgba(0,0,0,.45)';for(let y=0;y<64;y+=8)for(let x=0;x<64;x+=8)if((x+y)%16==0)g.fillRect(x,y,8,8)}
 if(p==8){const gr=g.createLinearGradient(0,64,0,0);gr.addColorStop(0,'rgba(255,60,0,.75)');gr.addColorStop(1,'rgba(255,220,0,0)');g.fillStyle=gr;g.fillRect(0,0,64,64)}
 if(p==9){g.strokeStyle='rgba(120,255,255,.6)';g.lineWidth=1;for(let i=0;i<10;i++){g.beginPath();g.moveTo(rr(0,64),rr(0,64));g.lineTo(rr(0,64),rr(0,64));g.stroke()}}
 if(p==10){g.strokeStyle='rgba(0,0,0,.4)';for(let y=0;y<64;y+=8)for(let x=(y/8%2)*8;x<64;x+=16){g.beginPath();g.arc(x,y,8,0,3.2);g.stroke()}}
 if(p==11){g.fillStyle='rgba(255,255,255,.6)';for(let i=0;i<14;i++)g.fillRect(rr(0,62),rr(0,62),2,2)}
 return new THREE.CanvasTexture(k)}
let mapG,boxes=[],spawns=[];
function build(id){if(mapG){sc.remove(mapG);disposeTree(mapG)}mapG=new THREE.Group();sc.add(mapG);boxes=[];const Z=MT[id],K=S.mode>2?2.4:1,rn=(()=>{let s=id*977+11;return()=>(s=s*16807%2147483647)/2147483647})(),r=a=>(rn()-.5)*a*K;sc.fog.color.set(Z.f);sc.fog.far=K>1?170:120;
 const g=new THREE.Mesh(new THREE.PlaneGeometry(130*K,130*K).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({map:tex('',Z.g,Math.round(28*K),Math.round(28*K))}));g.receiveShadow=true;mapG.add(g);
 const add=(x,z,w,d,h,c,t)=>{boxes.push({x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2,h});const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({map:tex(t,c,Math.max(1,Math.round(Math.max(w,d)/4)),Math.max(1,Math.round(h/4)))}));m.position.set(x,h/2,z);m.castShadow=m.receiveShadow=true;mapG.add(m)};
 const barrel=(x,z,c)=>{boxes.push({x0:x-.5,x1:x+.5,z0:z-.5,z1:z+.5,h:1.1});const m=new THREE.Mesh(new THREE.CylinderGeometry(.45,.45,1.1,12),new THREE.MeshPhongMaterial({color:c,shininess:30}));m.position.set(x,.55,z);m.castShadow=m.receiveShadow=true;mapG.add(m)};
 const rock=(x,z,s)=>{boxes.push({x0:x-s*.8,x1:x+s*.8,z0:z-s*.8,z1:z+s*.8,h:s*1.4});const m=new THREE.Mesh(new THREE.DodecahedronGeometry(s,0),new THREE.MeshLambertMaterial({map:tex('',Z.g)}));m.position.set(x,s*.6,z);m.rotation.set(rn(),rn()*6,0);m.castShadow=m.receiveShadow=true;mapG.add(m)};
 const E=41*K,Wd=84*K;add(0,-E,Wd,2,7,Z.w,Z.t);add(0,E,Wd,2,7,Z.w,Z.t);add(-E,0,2,Wd,7,Z.w,Z.t);add(E,0,2,Wd,7,Z.w,Z.t);
 const n=Z.c.length;
 if(Z.k){for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){if(!i&&!j){add(0,0,6,6,1.4,Z.c[0],'brick');continue}add(i*26*K,j*26*K,13+rn()*4,13+rn()*4,Z.h*(.6+rn()*.8),Z.c[(i+j)&1],(i+j)&1?'win':'brick')}}
 if(!Z.k||K>1)for(let i=0;i<(K>1?40:12);i++){const hz=rn()<.5,l=6+rn()*7;add(r(66),r(66),hz?l:2.4,hz?2.4:l,Z.h*(.6+rn()*.8),Z.c[i%n],Z.t)}
 for(let i=0;i<14*K*K;i++){const s=1.5+rn()*1.5;add(r(72),r(72),s,s,s,'#8b5a2b','crate')}
 for(let i=0;i<8*K*K;i++)barrel(r(70),r(70),Z.bc);for(let i=0;i<Z.r*K;i++)rock(r(70),r(70),1.2+rn()*1.4);
 spawns=[];for(let i=0;i<(K>1?700:80)&&spawns.length<(K>1?120:12);i++){const x=r(72),z=r(72);if(!col(x,z,1.3))spawns.push([x,z])}}
function col(x,z,r,y){for(const b of boxes)if(x>b.x0-r&&x<b.x1+r&&z>b.z0-r&&z<b.z1+r&&(y===undefined||b.h>y+.35))return true;return false}
function flo(x,z,y){let f=0;for(const b of boxes)if(x>b.x0-.3&&x<b.x1+.3&&z>b.z0-.3&&z<b.z1+.3&&b.h<=y+.4&&b.h>f)f=b.h;return f}
function fixPos(e){if(!col(e.x,e.z,.5))return;for(let r=1;r<14;r++)for(let a=0;a<8;a++){const x=e.x+Math.cos(a*.785)*r,z=e.z+Math.sin(a*.785)*r;if(!col(x,z,.5)){e.x=x;e.z=z;return}}}
function rbox(o,d,b){let t0=0,t1=1e9;for(const[p,v,mn,mx]of[[o.x,d.x,b.x0,b.x1],[o.y,d.y,0,b.h],[o.z,d.z,b.z0,b.z1]]){if(Math.abs(v)<1e-8){if(p<mn||p>mx)return 1e9}else{let a=(mn-p)/v,c=(mx-p)/v;if(a>c){const t=a;a=c;c=t}t0=Math.max(t0,a);t1=Math.min(t1,c);if(t0>t1)return 1e9}}return t0}
const wallT=(o,d)=>{let m=1e9;for(const b of boxes)m=Math.min(m,rbox(o,d,b));return m};
function rsph(o,d,c,r){const x=o.x-c[0],y=o.y-c[1],z=o.z-c[2],b=x*d.x+y*d.y+z*d.z,k=x*x+y*y+z*z-r*r,q=b*b-k;if(q<0)return 1e9;const t=-b-Math.sqrt(q);return t>0?t:1e9}
function los(ax,ay,az,bx,by,bz){const d={x:bx-ax,y:by-ay,z:bz-az},l=Math.hypot(d.x,d.y,d.z);d.x/=l;d.y/=l;d.z/=l;return wallT({x:ax,y:ay,z:az},d)>l}
