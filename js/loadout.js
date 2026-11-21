// ===== loadout.js : Call-of-Duty style loadout screen =====
// Three slots at the top (primary, secondary, operator). The right list shows every weapon as a card with its real
// 3D picture (gunIcon from wheel.js). The left "gunsmith" edits the attachments of the weapon in the selected slot,
// and the middle shows the weapon stats. The soldier preview behind the middle column is drawn by the game itself.
let lbSlot=0,lbOpen='sc';
const LB_ATT=[['اسکوپ',SCP,'sc'],['دهانه',MZ,'mz'],['دستگیره / لیزر',GR,'gr'],['خشاب',MG,'mg'],['رنگ گان',COLN,'cl'],['طرح اسکین',PAT,'pt']];
// Same rule startMatch() uses: the primary falls back to the selected weapon, the secondary may be empty.
const lbWeap=slot=>slot==0?(S.lo[0]&&S.owned[S.lo[0]]!==undefined?S.lo[0]:S.sel):(S.lo[1]&&S.owned[S.lo[1]]!==undefined?S.lo[1]:null);
const lbPow=k=>Math.round(WP[k].dmg*WP[k].pel);
function lbBars(k){const w=WP[k],a=att(k),rl=w.rl*(a.mg?1.15:1),rate=1/w.rof,acc=1-clamp(w.sp/.09,0,1),m=mg(k),
 rows=[['قدرت',lbPow(k),lbPow(k)/260],['سرعت شلیک',rate.toFixed(1),rate/22.3],['خشاب',m,m/100],['دقت',Math.round(acc*100),acc],['ریلود',rl.toFixed(1)+'s',clamp(1-(rl-1)/3.6,.05,1)]];
 return rows.map(r=>'<div class="lbb"><span>'+r[0]+'</span><i><u style="width:'+Math.round(clamp(r[2],.03,1)*100)+'%"></u></i><b>'+r[1]+'</b></div>').join('')}
function lbCard(k,slot){const w=WP[k],o=S.owned[k]!==undefined,ri=S.owned[k]||0,u=gunIcon(k,ri),cur=lbWeap(slot)==k,oth=lbWeap(slot?0:1)==k;
 const act=o?(cur?'<span class="lbok" role="img" aria-label="انتخاب‌شده">✔</span>':oth?'<small>در اسلحه‌ی دیگر</small>':'<button onclick="lbEquip(\''+k+'\')">انتخاب</button>')
  :'<button '+(S.coins<w.price?'disabled':'')+' onclick="lbBuy(\''+k+'\')">'+w.price+' '+ICO.E+'</button>';
 return '<div class="lbc'+(cur?' on':'')+(o?'':' lock')+'" style="--rc:'+hx(RAR[ri][1])+'">'+(u?'<img alt="" src="'+u+'">':'')+
  '<div class="rt"><b>'+w.n+'</b><small>'+(o?whShort(ri):'قفل')+' · قدرت '+lbPow(k)+'</small></div>'+act+'</div>'}
function lbList(){
 if(lbSlot==2)return '<h3>اپراتور</h3><p>رنگ لباس سرباز را انتخاب کن.</p><div class="lbo">'+OPS.map((o,i)=>'<button class="'+(S.op==i?'on':'')+'" aria-pressed="'+(S.op==i)+'" style="--c:'+hx(o.c)+'" onclick="lbOp('+i+')"><i></i><span>'+o.n+'</span></button>').join('')+'</div>';
 const ks=Object.keys(WP).sort((a,b)=>(S.owned[b]!==undefined)-(S.owned[a]!==undefined)||WP[a].price-WP[b].price);
 return '<h3>'+(lbSlot?'اسلحه‌ی فرعی':'اسلحه‌ی اصلی')+'</h3>'+(lbSlot&&lbWeap(1)?'<button class="m g" onclick="lbClear()">برداشتن اسلحه‌ی فرعی</button>':'')+ks.map(k=>lbCard(k,lbSlot)).join('')}
function lbSmith(k){
 if(lbSlot==2)return '<h3>شخصیت</h3><p>شخصیت‌ها و اسکین‌های بیشتر بعداً اضافه می‌شوند.</p>';
 if(!k)return '<h3>اسلحه‌ی فرعی</h3><p>هنوز اسلحه‌ی فرعی انتخاب نکرده‌ای. از لیست سمت راست یکی را انتخاب کن.</p>';
 const a=att(k);
 return '<h3>گان‌اسمیث · '+WP[k].n+'</h3>'+LB_ATT.map(([l,arr,key])=>{const open=lbOpen==key,c=arr[a[key]],nm=typeof c=='object'?c.n:c;
  return '<div class="lba'+(open?' open':'')+'"><button class="lbh" aria-expanded="'+open+'" onclick="lbTog(\''+key+'\')"><span>'+l+'</span><b>'+nm+'</b></button>'+
   (open?chips(arr,a[key],i=>"lbSet('"+k+"','"+key+"',"+i+")",key=='pt'?i=>S.lv<(i>5?(i-5)*3:0):null)+(key=='pt'?'<small class="lbn">طرح‌های بیشتر با بالا رفتن لول باز می‌شوند</small>':''):'')+'</div>'}).join('')}
function loadoutHTML(){const p=lbWeap(0),s=lbWeap(1),k=lbSlot==2?null:lbWeap(lbSlot);
 const sl=(i,t,v)=>'<button class="lbsl'+(lbSlot==i?' on':'')+'" aria-pressed="'+(lbSlot==i)+'" onclick="lbGo('+i+')"><small>'+t+'</small><b>'+v+'</b></button>';
 return '<div class="lbx"><div class="lbl" id="lbl">'+lbList()+'</div><div class="lbm"><div class="lbs">'+sl(0,'اصلی',p?WP[p].n:'—')+sl(1,'فرعی',s?WP[s].n:'—')+sl(2,'اپراتور',OPS[S.op].n)+'</div>'+
  '<div class="lbst">'+(k?'<b>'+WP[k].n+'</b>'+lbBars(k):'<small>'+(lbSlot==2?'ظاهر سرباز':'اسلحه‌ای انتخاب نشده')+'</small>')+'</div></div><div class="lbr" id="lbr">'+lbSmith(k)+'</div></div>'}
// re-render the screen but keep the scroll position of both lists (the whole screen is rebuilt on every change)
function lbRe(){const a=$('lbl'),b=$('lbr'),x=a?a.scrollTop:0,y=b?b.scrollTop:0;view('arm');const a2=$('lbl'),b2=$('lbr');if(a2)a2.scrollTop=x;if(b2)b2.scrollTop=y}
function lbGo(i){lbSlot=i;lbOpen='sc';view('arm')}
function lbTog(key){lbOpen=lbOpen==key?'':key;lbRe()}
function lbSet(k,key,i){S.att[k]=Object.assign(S.att[k]||{},{[key]:i});save();lbRe()}
function lbEquip(k){if(S.owned[k]===undefined||lbWeap(lbSlot?0:1)==k)return;if(lbSlot==0){S.sel=k;S.lo[0]=k}else S.lo[1]=k;save();lbRe()}
function lbClear(){S.lo[1]=null;save();lbRe()}
function lbBuy(k){if(S.owned[k]!==undefined||S.coins<WP[k].price)return;S.coins-=WP[k].price;S.owned[k]=0;save();lbRe()}
function lbOp(i){S.op=i;save();lbRe()}
