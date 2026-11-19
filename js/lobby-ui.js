// ===== lobby-ui.js : lobby building blocks (icons, currencies, toast) and the main lobby screen =====
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Names are rendered with innerHTML in several places, so markup characters are removed at the source.
S.name=String(S.name||'').replace(/[<>&"'`]/g,'').slice(0,14)||'Player';
// ES = premium currency. Starts at 50 and is earned by completing missions (see missions.js). Nothing spends it yet.
if(!Number.isFinite(S.es))S.es=50;
const IC={
 cart:'<path d="M3 4h3l2.5 11h9.5l2-8H7"/><circle cx="10" cy="19.5" r="1.5"/><circle cx="17" cy="19.5" r="1.5"/>',
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
 gift:'<rect x="3" y="9" width="18" height="12" rx="1"/><path d="M12 9v12M3 13h18M12 9c-4-5-8 0-4 0M12 9c4-5 8 0 4 0"/>',
 cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
 people:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-4 3-6 6.5-6s6.5 2 6.5 6M16 5a3.5 3.5 0 0 1 0 6.5M18 14c2.5.8 3.8 2.8 3.8 6"/>',
 trophy:'<path d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H3c0 4 2 6 4 6M17 6h4c0 4-2 6-4 6M12 14v4M8 21h8M10 18h4"/>',
 home:'<path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/>',
 gun:'<path d="M2 9h13l2-2h5v4h-3l-1 2h-4l-1 5H8l1-5H2z"/>',
 helmet:'<path d="M4 14a8 8 0 0 1 16 0v3H4zM4 17l2 3h12l2-3M9 14h6"/>',
 shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M12 8l1.5 3 3.3.4-2.4 2.3.6 3.3L12 15.4 9 17l.6-3.3-2.4-2.3 3.3-.4z"/>',
 chart:'<path d="M5 20V10M12 20V4M19 20v-7"/>',
 gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>',
 skull:'<path d="M12 3a8 8 0 0 0-5 14v3h10v-3a8 8 0 0 0-5-14z"/><circle cx="9" cy="11" r="1.6"/><circle cx="15" cy="11" r="1.6"/><path d="M12 14v2M10 20v-2M14 20v-2"/>',
 mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 7 9-7"/>',
 wifi:'<path d="M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19.5" r="1"/>',
 chest:'<rect x="3" y="9" width="18" height="11" rx="1"/><path d="M3 13h18M12 11v4M3 9a9 9 0 0 1 18 0"/>',
 pin:'<path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
 chev:'<path d="M9 6l6 6-6 6"/>',
 play:'<path d="M7 4l13 8-13 8z" fill="currentColor"/>'};
const ic=n=>'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+IC[n]+'</svg>';
// Currency symbols: E (gold coin) and ES (blue crystal). Use these everywhere a price or balance is shown.
const ICO={
 E:'<svg class="ico" viewBox="0 0 32 32" role="img" aria-label="E"><circle cx="16" cy="16" r="14" fill="#f1c40f" stroke="#8a6a00" stroke-width="2"/><circle cx="16" cy="16" r="10" fill="none" stroke="#a67c00" stroke-width="1.5"/><text x="16" y="21" text-anchor="middle" font-size="14" font-weight="700" fill="#5a4300" font-family="Tahoma,sans-serif">E</text></svg>',
 ES:'<svg class="ico" viewBox="0 0 32 32" role="img" aria-label="ES"><polygon points="16,1 29,8.5 29,23.5 16,31 3,23.5 3,8.5" fill="#1e5fd1" stroke="#8fc2ff" stroke-width="2"/><text x="16" y="20" text-anchor="middle" font-size="11" font-weight="700" fill="#fff" font-family="Tahoma,sans-serif">ES</text></svg>'};
const cur=()=>'<span class="cur">'+ICO.E+S.coins+'</span><span class="cur">'+ICO.ES+S.es+'</span>';
const AVA='<svg viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" fill="#0b1018"/><path d="M24 6c-9 0-14 7-14 16v20h28V22C38 13 33 6 24 6z" fill="#1b2028"/><ellipse cx="24" cy="24" rx="8" ry="10" fill="#0e1218"/><path d="M16 29h16v8H16z" fill="#d9dee6"/><rect x="17" y="21" width="14" height="3" fill="#5ac8ff"/></svg>';
function toast(t){const e=$('toast');if(!e)return;e.textContent=t;e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('on'),1900)}
const soon=n=>toast('«'+n+'» هنوز آماده نیست')
function netUp(){const e=$('net');if(e){e.classList.toggle('ok',navigator.onLine);e.classList.toggle('off',!navigator.onLine)}}
addEventListener('online',netUp);addEventListener('offline',netUp);
function lobbyHTML(){
 const dly=Date.now()-S.daily>864e5,pct=clamp(S.xp/need()*100,0,100),mp=S.mode==2?'مرحله '+(S.cl+1)+' · '+MAPN[LV[S.cl].map]:MAPN[S.map];
 const mi=(i,t,f,o)=>'<button class="mi'+(o&&o.g?' gold':'')+'" onclick="'+f+'">'+ic(i)+'<span>'+t+'</span>'+(o&&o.dot?'<i class="dot" role="img" aria-label="جایزه آماده است"></i>':'')+'</button>';
 const nv=(i,t,f,on)=>'<button class="nv3'+(on?' on':'')+'"'+(on?' aria-current="page"':'')+' onclick="'+f+'">'+ic(i)+'<span>'+t+'</span></button>';
 const pc=(i,a,b,f,cls,chev)=>'<button class="pc'+(cls?' '+cls:'')+'" onclick="'+f+'">'+ic(i)+'<div class="rt"><small>'+a+'</small><b>'+b+'</b></div>'+(chev?ic('chev'):'')+'</button>';
 return '<div class="lob3"><div class="tb">'+
  '<div class="logo" role="img" aria-label="ELIS STRIKE V2"><span>ELIS</span><span>STRIKE</span><small>V2</small></div>'+
  '<button class="prof" onclick="rename()" aria-label="تغییر نام">'+AVA+'<div class="rt"><b>'+esc(S.name)+'</b><small>Lv. '+S.lv+'</small><div class="xpb"><i style="width:'+pct+'%"></i></div></div></button><div class="sp"></div>'+
  '<div class="cu">'+ICO.E+'<b>'+S.coins+'</b><button aria-label="افزودن E" onclick="view(\'box\')">+</button></div>'+
  '<div class="cu es">'+ICO.ES+'<b>'+S.es+'</b><button aria-label="کسب ES از مأموریت‌ها" onclick="view(\'ms\')">+</button></div>'+
  '<button class="ib" aria-label="دوستان" onclick="soon(\'دوستان\')">'+ic('people')+'</button><button class="ib" aria-label="پیام‌ها" onclick="soon(\'پیام‌ها\')">'+ic('mail')+'</button><button class="ib" aria-label="تنظیمات" onclick="view(\'set\')">'+ic('gear')+'</button>'+
  '<span id="net" class="net ok" role="img" aria-label="وضعیت اتصال">'+ic('wifi')+'</span></div>'+
  '<nav class="lm" aria-label="منوی اصلی">'+mi('cart','فروشگاه',"view('box')",{g:1})+mi('target','مأموریت‌ها',"view('ms')",{dot:msReady()})+mi('gift','جوایز روزانه','daily()',{dot:dly})+mi('cal','رویدادها',"soon('رویدادها')")+mi('people','دوستان',"soon('دوستان')")+mi('trophy','جدول رتبه‌بندی',"view('lb')")+'</nav>'+
  '<div class="rc">'+pc('trophy','به‌زودی','مسابقات ویژه',"soon('مسابقات ویژه')",'promo')+pc('skull','حالت بازی',NM[S.mode],"view('modes')",'',1)+pc('pin','انتخاب نقشه',mp,"view('modes')",'',1)+pc('chest','رویداد ویژه','جعبه‌های جایزه',"view('box')",'ev')+'</div>'+
  '<nav class="bn" aria-label="ناوبری">'+nv('home','خانه',"view('main')",1)+nv('gun','لوداوت',"view('arm')")+nv('helmet','شخصیت',"view('chr')")+nv('shield','کلن',"soon('کلن')")+nv('chart','رتبه‌بندی',"view('lb')")+nv('gear','تنظیمات',"view('set')")+'</nav>'+
  '<button class="go" onclick="startMatch()"><span>شروع بازی</span>'+ic('play')+'</button><div id="toast" class="toast" role="status" aria-live="polite"></div></div>'}
