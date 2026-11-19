// ===== backdrop.js : procedural lobby backdrop (night military base), painted once onto a canvas =====
function paintLobbyBg(g){
 const W=1024,H=512,HZ=290;let sd=7;const rnd=()=>(sd=sd*16807%2147483647)/2147483647;
 const lin=(x0,y0,x1,y1,st)=>{const q=g.createLinearGradient(x0,y0,x1,y1);st.forEach(([o,c])=>q.addColorStop(o,c));return q};
 const glow=(x,y,r,c0)=>{const q=g.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,c0);q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.fillRect(x-r,y-r,2*r,2*r)};
 const poly=(pts,fill)=>{g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fillStyle=fill;g.fill()};
 const rect=(x,y,w,h,fill)=>{g.fillStyle=fill;g.fillRect(x,y,w,h)};
 // sky, clouds, warm glow behind the tower
 rect(0,0,W,HZ+2,lin(0,0,0,HZ,[[0,'#060b1c'],[.5,'#13285e'],[1,'#3b5a94']]));
 for(let i=0;i<14;i++){g.save();g.translate(rnd()*W,20+rnd()*170);g.scale(3+rnd()*3,1);glow(0,0,40+rnd()*40,'rgba(120,150,215,.22)');g.restore()}
 glow(780,HZ-20,280,'rgba(255,190,90,.30)');
 // snowy mountains (two ridges)
 const ridge=(yb,amp,step,fill,snow)=>{const pts=[[0,HZ]];for(let x=0;x<=W+step;x+=step)pts.push([x,yb-amp*(.35+rnd()*.65)]);pts.push([W+step,HZ]);poly(pts,fill);
  if(snow)for(let i=1;i<pts.length-1;i++){const[x,y]=pts[i];if(y<yb-amp*.7)poly([[x,y],[x-14,y+22],[x-4,y+16],[x+4,y+25],[x+14,y+20]],'rgba(205,225,255,.55)')}};
 ridge(HZ-40,150,70,'#1f3359',true);ridge(HZ-6,90,52,'#101b33',false);
 // wet ground
 rect(0,HZ,W,H-HZ,lin(0,HZ,0,H,[[0,'#232c44'],[.35,'#121828'],[1,'#05070d']]));
 // control tower with banner
 const tx=700;
 poly([[tx-30,HZ+4],[tx-22,HZ-140],[tx+22,HZ-140],[tx+30,HZ+4]],'#1a2234');
 for(let i=0;i<14;i++)if(rnd()<.5)rect(tx-14+(i%2)*16,HZ-130+Math.floor(i/2)*16,8,6,'rgba(255,214,130,.8)');
 rect(tx-46,HZ-190,92,52,'#0f1522');
 rect(tx-42,HZ-184,84,22,lin(0,HZ-184,0,HZ-162,[[0,'#ffe9a8'],[1,'#c98a2a']]));
 for(let i=0;i<5;i++)rect(tx-42+i*17,HZ-184,3,22,'#0f1522');
 rect(tx-52,HZ-142,104,6,'#0f1522');rect(tx-1.5,HZ-250,3,60,'#0f1522');glow(tx,HZ-250,12,'rgba(255,60,60,.9)');
 rect(tx-16,HZ-126,32,84,'#0d1830');g.strokeStyle='#e8b923';g.lineWidth=2;g.strokeRect(tx-16,HZ-126,32,84);
 g.fillStyle='#e8b923';g.font='bold 22px Tahoma,sans-serif';g.textAlign='center';g.fillText('E',tx,HZ-78);
 // flood-light poles
 [560,900].forEach(x=>{glow(x,HZ-122,110,'rgba(255,235,170,.55)');rect(x-2,HZ-120,4,130,'#0a0f1a');rect(x-16,HZ-128,32,10,'#0a0f1a');rect(x-14,HZ-126,28,4,'#fff6d0')});
 // stacked containers
 [[350,HZ-4,90,34,'#1d2740'],[444,HZ-4,90,34,'#2a2f3a'],[400,HZ-38,90,34,'#262d3d'],[540,HZ-4,80,34,'#1d2740']].forEach(([x,y,w,h,c])=>{rect(x,y,w,h,c);for(let i=6;i<w;i+=10)rect(x+i,y,2,h,'rgba(0,0,0,.35)');rect(x,y,w,2,'#b8892b')});
 // helicopter silhouette
 g.save();g.translate(190,HZ-34);
 g.fillStyle='#0a0f1a';g.beginPath();g.ellipse(0,0,78,32,0,0,6.3);g.fill();
 poly([[60,-14],[210,-24],[212,-10],[62,10]],'#0a0f1a');poly([[200,-24],[222,-52],[232,-50],[214,-8]],'#0a0f1a');
 rect(-4,-44,8,16,'#0a0f1a');rect(-150,-48,300,3,'#0a0f1a');
 poly([[-70,-14],[-30,-24],[-26,-4],[-72,0]],'rgba(120,200,255,.55)');
 rect(-60,34,120,4,'#0a0f1a');rect(-40,26,4,10,'#0a0f1a');rect(36,26,4,10,'#0a0f1a');
 g.restore();
 // military truck
 g.save();g.translate(760,HZ+10);
 poly([[0,-52],[110,-52],[112,0],[0,0]],'#10151f');rect(0,-30,110,2,'#b8892b');
 poly([[110,-58],[170,-58],[190,-24],[190,0],[110,0]],'#0c111b');poly([[120,-52],[160,-52],[176,-28],[120,-28]],'rgba(160,200,255,.5)');
 [30,150].forEach(x=>{g.beginPath();g.arc(x,0,20,0,6.3);g.fillStyle='#05070b';g.fill();g.beginPath();g.arc(x,0,9,0,6.3);g.fillStyle='#1b2330';g.fill()});
 glow(192,-14,70,'rgba(255,220,140,.9)');g.restore();
 // light reflections on the wet ground
 g.globalCompositeOperation='lighter';
 [[560,'255,225,150',.30],[900,'255,225,150',.30],[700,'255,190,90',.22],[950,'255,220,140',.25],[110,'120,190,255',.18]].forEach(([x,c,a])=>rect(x-16,HZ+36,32,H-HZ-36,lin(0,HZ+36,0,H,[[0,'rgba('+c+','+a+')'],[1,'rgba('+c+',0)']])));
 for(let i=0;i<4;i++){g.save();g.translate(200+i*210,HZ+110+rnd()*80);g.scale(4,1);glow(0,0,40,'rgba(130,170,255,.10)');g.restore()}
 g.globalCompositeOperation='source-over';
 // foreground crates + vignette
 [[10,400,140,70],[870,410,150,66]].forEach(([x,y,w,h])=>{rect(x,y,w,h,'#0b0f18');rect(x,y,w,3,'#b8892b');rect(x,y+h-3,w,3,'#6b5217')});
 const v=g.createRadialGradient(W/2,H*.55,H*.35,W/2,H*.55,W*.62);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.6)');rect(0,0,W,H,v);
}
// Adds the painted backdrop behind the preview soldier. It only shows in the lobby; during a match it is hidden.
function lobbyBackdrop(){
 const k=document.createElement('canvas');k.width=1024;k.height=512;paintLobbyBg(k.getContext('2d'));
 const m=new THREE.Mesh(new THREE.PlaneGeometry(18,9),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(k),fog:false,depthWrite:false}));
 m.position.set(0,300.8,-6);m.renderOrder=-1;sc.add(m);
 (function sync(){requestAnimationFrame(sync);m.visible=state!='play';if(pv&&state!='play')pv.position.y=300+Math.sin(tm*1.7)*.012})(); // idle "breathing"
}
