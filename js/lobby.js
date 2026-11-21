// ===== lobby.js : screens (lobby, armory, wheel, missions...), startup =====
// Every screen except the lobby itself uses shell(): top bar (back, title, E/ES) + content + bottom nav.
const bt=(t,f,c)=>'<button class="m '+(c||'')+'" onclick="'+f+'">'+t+'</button>';
const chips=(arr,cur,fn,dis)=>'<div class="chips">'+arr.map((n,i)=>'<button class="'+(cur==i?'on':'')+'" '+(dis&&dis(i)?'disabled':'')+' onclick="'+fn(i)+'">'+(n.n||n)+'</button>').join('')+'</div>';
let curView='main';
function navHTML(a){const t=(k,i,n,f)=>'<button class="nv3'+(a==k?' on':'')+'"'+(a==k?' aria-current="page"':'')+' onclick="'+f+'">'+ic(i)+'<span>'+n+'</span></button>';
 return '<nav class="bn" aria-label="ناوبری">'+t('home','home','خانه',"view('main')")+t('arm','gun','لوداوت',"view('arm')")+t('chr','helmet','شخصیت',"view('chr')")+t('clan','shield','کلن',"soon('کلن')")+t('lb','chart','رتبه‌بندی',"view('lb')")+t('set','gear','تنظیمات',"view('set')")+'</nav>'}
function shell(title,body,tab,bare){
 return '<div class="lob3 scr"><div class="tb"><button class="bk" aria-label="بازگشت" onclick="save();view(\'main\')">'+ic('chev')+'</button><h2 class="ttl">'+title+'</h2><div class="sp"></div>'+
  '<div class="cu">'+ICO.E+'<b>'+S.coins+'</b></div><div class="cu es">'+ICO.ES+'<b>'+S.es+'</b></div></div>'+
  '<div class="sbody"><div class="pnl'+(bare?' bare':'')+'">'+body+'</div></div>'+navHTML(tab)+'<div id="toast" class="toast" role="status" aria-live="polite"></div></div>'}
const mapCard=(i,label,on,dis,fn)=>'<button class="mapc'+(on?' on':'')+'"'+(dis?' disabled':'')+' style="--g:'+MT[i].g+';--f:'+hx(MT[i].f)+'" onclick="'+fn+'"><b>'+label+'</b></button>';
function view(v){const m=$('mv'),S_=(t,b,tab,bare)=>{m.className='card lob3w';m.innerHTML=shell(t,b,tab,bare)};curView=v;$('menu').style.display='flex';
 if(v=='main'||v=='arm'||v=='chr')pvBuild();
 if(v=='arm')S_('لوداوت',loadoutHTML(),'arm',1)
 else if(v=='chr')S_('شخصیت','<div class="pn chp"><h3>اپراتور</h3><p>رنگ لباس سرباز را انتخاب کن. شخصیت و اسکین‌های بیشتر بعداً اضافه می‌شوند.</p>'+chips(OPS,S.op,i=>'S.op='+i+";save();view('chr')")+'</div>','chr',1)
 else if(v=='ms')S_('مأموریت‌ها','<p>ES فقط از مأموریت‌ها به دست می‌آید.</p>'+msHTML(),'')
 else if(v=='lb'){const nm=['xShadow','Kira_77','NoScope','Vortex','Reza.GG','Blaze','Sniper_Ali','Ghost','Mahan','Hunter','Zed','Nima_pro','Storm','Viper','Aras','Dara','Omid_X','Sia','Rostam','Kaveh','Tina','Arya','Navid','Pouya'],L=nm.map((n,i)=>({n,lv:58-i*2,k:2800-i*105+(i*53%90),b:1}));L.push({n:S.name,lv:S.lv,k:S.kills,b:0});L.sort((a,b)=>b.lv-a.lv||b.k-a.k);
  const rows=L.map((x,i)=>'<div class="row'+(x.b?'':' me')+'"><span>#'+(i+1)+' '+esc(x.n)+(x.b?' <small>[BOT]</small>':' ⭐')+'</span><small>لول '+x.lv+' · '+x.k+' کیل</small></div>').filter((r,i)=>i<12||!L[i].b).join('');
  S_('رتبه‌بندی','<p>فعلاً رقبا شبیه‌سازی شده‌اند (BOT). بعد از وصل شدن سرور، بازیکن‌های واقعی جایگزین می‌شوند.</p>'+rows+bt('تغییر نام','rename()','g'),'lb')}
 else if(v=='set'){const rg=(l,k,a,b)=>'<h3>'+l+': <span id="sv_'+k+'">'+S.set[k]+'</span></h3><input type=range min='+a+' max='+b+' value='+S.set[k]+' oninput="S.set.'+k+'=+this.value;document.getElementById(\'sv_'+k+'\').textContent=this.value;save()">';
  S_('تنظیمات',bt('🎮 تنظیم محل و اندازه دکمه‌های نبرد','editHud()','g')+rg('حساسیت دوربین','sens',1,10)+rg('حساسیت نشانه‌گیری (ADS)','ad',1,10)+rg('میدان دید (FOV)','fov',60,100)+rg('صدا','vol',0,10)+'<h3>کیفیت گرافیک (صفحه دوباره بارگذاری می‌شود)</h3><div class="two">'+['پایین','متوسط','بالا'].map((n,i)=>bt(n,'S.set.q='+i+';save();location.reload()',S.set.q==i?'':'g')).join('')+'</div><h3>سختی بات‌ها</h3><div class="two">'+DN.map((n,i)=>bt(n,'S.set.diff='+i+';save();view(\'set\')',S.set.diff==i?'':'g')).join('')+'</div>','set')}
 else if(v=='box'){S_('گردونه جایزه',wheelHTML(),'');wheelInit()}
 else if(v=='modes'){const md=S.mode,lv=md==2,cards=lv?LV.map((l,i)=>mapCard(l.map,(i+1)+' · '+MT[l.map].n+' · هدف '+l.goal,S.cl==i,i>S.camp,'S.cl='+i+';S.map='+l.map+";view('modes')")):MT.map((z,i)=>mapCard(i,z.n,S.map==i,false,'S.map='+i+";view('modes')"));
  S_('حالت بازی و نقشه','<h3>حالت بازی</h3>'+chips(NM,md,i=>'S.mode='+i+";view('modes')")+'<h3>'+(lv?'مرحله':'نقشه')+'</h3><div class="mapg">'+cards.join('')+'</div><h3>سختی بات‌ها</h3>'+chips(DN,S.set.diff,i=>'S.set.diff='+i+";save();view('modes')")+(md>2?'<p>۹۹ دشمن بات · زون کوچک‌شونده · '+(md==4?'اسکواد ۴ نفره (۳ هم‌تیمی بات)':'تک‌نفره')+'</p>':'')+bt('تأیید',"save();view('main')"),'')}
 else{m.className='card lob3w';m.innerHTML=lobbyHTML();netUp()}}
function rename(){const n=prompt('نام جدید',S.name);if(n){S.name=n.replace(/[<>&"'`]/g,'').slice(0,14)||S.name;save();view(curView)}}
function daily(){if(Date.now()-S.daily<=864e5)return toast('جایزه‌ی امروز را گرفته‌ای؛ بعداً دوباره بیا');S.daily=Date.now();S.coins+=200;save();view('main');toast('+۲۰۰ E دریافت شد')}
// v3 debug overlay: open the game with #debug at the end of the URL to see GPU object counts
if(location.hash=='#debug'){const d=document.createElement('div');d.style.cssText='position:fixed;left:6px;bottom:6px;z-index:99;font:11px monospace;color:#0f0;background:#000a;padding:2px 6px;pointer-events:none';document.body.appendChild(d);setInterval(()=>{const mm=R.info.memory;d.textContent='geo '+mm.geometries+' tex '+mm.textures},1000)}
// ---------- startup ----------
lobbyBackdrop();applyLay();build(S.map);view('main');requestAnimationFrame(loop);addEventListener('pagehide',save);
