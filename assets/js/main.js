(function(){
  var root=document.documentElement;
  function $(id){return document.getElementById(id)}
  function lang(){return root.getAttribute('data-lang')}

  /* ---------- language (remembered across pages) ---------- */
  var LANGS=['sk','en','de','pl'];
  var LOC={sk:'sk-SK',en:'en-GB',de:'de-DE',pl:'pl-PL'};
  var TXT={
    day:{sk:'m³/deň',en:'m³/day',de:'m³/Tag',pl:'m³/dobę'},
    perday:{sk:' m³ za deň',en:' m³ per day',de:' m³ pro Tag',pl:' m³ na dobę'},
    err:{sk:'Vyplňte meno a platnú e-mailovú adresu.',en:'Please fill in your name and a valid e-mail address.',de:'Bitte geben Sie Ihren Namen und eine gültige E-Mail-Adresse ein.',pl:'Proszę podać imię i nazwisko oraz poprawny adres e-mail.'},
    ok:{sk:'Otvorí sa váš e-mailový program s pripravenou správou. Ak sa neotvorí, napíšte na info@novetech.eu.',en:'Your e-mail app should open with the message ready. If it does not, write to info@novetech.eu.',de:'Ihr E-Mail-Programm öffnet sich mit der vorbereiteten Nachricht. Falls nicht, schreiben Sie an info@novetech.eu.',pl:'Otworzy się program pocztowy z przygotowaną wiadomością. Jeśli tak się nie stanie, prosimy pisać na info@novetech.eu.'},
    name:{sk:'Meno: ',en:'Name: ',de:'Name: ',pl:'Imię i nazwisko: '},
    org:{sk:'Organizácia: ',en:'Organisation: ',de:'Organisation: ',pl:'Organizacja: '},
    role:{sk:'Záujem: ',en:'Interest: ',de:'Interesse: ',pl:'Zainteresowanie: '}
  };
  function t(k){return TXT[k][lang()]||TXT[k].en}
  var lbtn=$('lang-btn'),lmenu=$('lang-menu');
  function langMenu(open){if(!lbtn)return;lbtn.setAttribute('aria-expanded',open);lmenu.classList.toggle('open',open);
    if(open){var cur=lmenu.querySelector('[aria-current="true"]');if(cur)cur.focus()}}
  if(lbtn){
    lbtn.addEventListener('click',function(e){e.stopPropagation();langMenu(lbtn.getAttribute('aria-expanded')!=='true')});
    document.addEventListener('click',function(e){if(!$('lang-dd').contains(e.target))langMenu(false)});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&lbtn.getAttribute('aria-expanded')==='true'){langMenu(false);lbtn.focus()}});
    lmenu.addEventListener('keydown',function(e){if(e.key!=='ArrowDown'&&e.key!=='ArrowUp')return;e.preventDefault();
      var it=[].slice.call(lmenu.querySelectorAll('a')),i=it.indexOf(document.activeElement);
      it[(i+(e.key==='ArrowDown'?1:it.length-1))%it.length].focus()});
  }

  /* ---------- mobile menu ---------- */
  var mb=$('menu-btn'),menu=$('menu');
  if(mb&&menu){
    mb.addEventListener('click',function(){
      var open=mb.getAttribute('aria-expanded')!=='true';
      mb.setAttribute('aria-expanded',open);menu.classList.toggle('open',open);
    });
  }

  /* ---------- scale explorer (projekt) ---------- */
  var D={
    cap:[100,200,350,500,700,1000,2000,4000,10000,50000,100000,500000,1000000],
    kwh:[0.39,0.36,0.35,0.34,0.33,0.30,0.29,0.28,0.25,0.20,0.18,0.17,0.15],
    dim:["7×6×10","8×7×10","9×9×10","10×10×10","12×10×10","15×10×10","17,5×12×10","15×15×10","21×18×10","36×33×21","48×45×24","81×60×36","96×78×45"],
    built:[0.004,0.006,0.008,0.01,0.012,0.015,0.02,0.027,0.036,0.12,0.21,0.50,0.75],
    zone:[15,15,20,20,20,20,20,20,20,20,30,40,50],
    power:[1.32,2.51,4.82,6.38,9.4,12.4,63.3,123.4,375,610,1215,5080,9970],
    site:[0.13,0.14,0.24,0.25,0.26,0.275,0.30,0.31,0.36,0.56,1.14,2.26,3.5]
  };
  function fmt(n,d){
    var l=LOC[lang()]||'sk-SK';
    return n.toLocaleString(l,{minimumFractionDigits:d||0,maximumFractionDigits:d===undefined?2:d});
  }
  function area(ha){return ha<1?fmt(Math.round(ha*10000),0)+' m²':fmt(ha,2)+' ha'}
  var slider=$('cap');
  function renderScale(){
    var i=+slider.value, en=lang()!=='sk';
    $('cap-out').innerHTML=fmt(D.cap[i],0)+'<small>'+t('day')+'</small>';
    slider.setAttribute('aria-valuetext',fmt(D.cap[i],0)+t('perday'));
    $('r-e').textContent=fmt(D.kwh[i],2)+' kWh/m³';
    $('r-d').textContent=(lang()==='en'?D.dim[i].replace(',','.'):D.dim[i])+' m';
    $('r-a').textContent=area(D.built[i]);
    $('r-z').textContent=D.zone[i]+' m';
    $('r-p').textContent=fmt(D.power[i],D.power[i]<100?1:0)+' kW';
    $('r-s').textContent=area(D.site[i]);
    drawChart(i);
  }
  function drawChart(sel){
    var svg=$('chart'),W=520,H=340,L=56,R=20,T=24,B=48,xmin=2,xmax=6,ymin=0,ymax=0.45;
    function x(c){return L+(Math.log10(c)-xmin)/(xmax-xmin)*(W-L-R)}
    function y(v){return T+(1-(v-ymin)/(ymax-ymin))*(H-T-B)}
    var s='',M='font-family="IBM Plex Mono,monospace" font-size="11" fill="#8FB2C8"';
    [0,0.1,0.2,0.3,0.4].forEach(function(v){
      s+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+y(v)+'" y2="'+y(v)+'" stroke="#9DDCFF" stroke-opacity=".14"/>';
      s+='<text x="'+(L-10)+'" y="'+(y(v)+4)+'" text-anchor="end" '+M+'>'+fmt(v,1)+'</text>';
    });
    [[100,'100'],[1000,'1 k'],[10000,'10 k'],[100000,'100 k'],[1000000,'1 M']].forEach(function(t){
      s+='<line x1="'+x(t[0])+'" x2="'+x(t[0])+'" y1="'+T+'" y2="'+(H-B)+'" stroke="#9DDCFF" stroke-opacity=".08"/>';
      s+='<text x="'+x(t[0])+'" y="'+(H-B+20)+'" text-anchor="middle" '+M+'>'+t[1]+'</text>';
    });
    s+='<text x="'+(W-R)+'" y="'+(H-6)+'" text-anchor="end" '+M+'>'+t('day')+'</text>';
    s+='<text x="'+L+'" y="14" '+M+'>kWh/m³</text>';
    var pts=D.cap.map(function(c,i){return x(c)+','+y(D.kwh[i])});
    s+='<path d="M'+x(D.cap[0])+','+y(0)+' L'+pts.join(' L')+' L'+x(D.cap[12])+','+y(0)+' Z" fill="#9DDCFF" fill-opacity=".12"/>';
    s+='<polyline points="'+pts.join(' ')+'" fill="none" stroke="#9DDCFF" stroke-width="2.5" stroke-linejoin="round"/>';
    D.cap.forEach(function(c,i){s+='<circle cx="'+x(c)+'" cy="'+y(D.kwh[i])+'" r="3" fill="#0E3550" stroke="#9DDCFF" stroke-width="1.5"/>'});
    var sx=x(D.cap[sel]),sy=y(D.kwh[sel]),tx=Math.min(Math.max(sx,L+40),W-R-40);
    s+='<line x1="'+sx+'" x2="'+sx+'" y1="'+sy+'" y2="'+(H-B)+'" stroke="#FFFFFF" stroke-opacity=".5" stroke-dasharray="3 4"/>';
    s+='<circle cx="'+sx+'" cy="'+sy+'" r="7" fill="#FFFFFF"/>';
    s+='<text x="'+tx+'" y="'+(sy-16)+'" text-anchor="middle" font-family="Archivo,sans-serif" font-weight="700" font-size="16" fill="#FFFFFF">'+fmt(D.kwh[sel],2)+'</text>';
    svg.innerHTML=s;
  }
  if(slider)slider.addEventListener('input',renderScale);

  if(slider)renderScale();

  /* ---------- lightbox ---------- */
  var lb=$('lb');
  if(lb){
    var lbi=lb.querySelector('img');
    document.querySelectorAll('[data-zoom]').forEach(function(a){
      a.addEventListener('click',function(e){
        if(!lb.showModal)return;
        e.preventDefault();lbi.src=a.getAttribute('href');lbi.alt=a.querySelector('img').alt;lb.showModal();
      });
    });
    lb.querySelector('button').onclick=function(){lb.close()};
    lb.addEventListener('click',function(e){if(e.target===lb)lb.close()});
  }

  /* ---------- contact form → e-mail draft ---------- */
  var form=$('form');
  if(form){
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var f=e.target,msg=$('form-msg'),role=f.role.options[f.role.selectedIndex].text;
      if(!f.name.value.trim()||!/^\S+@\S+\.\S+$/.test(f.email.value)){
        msg.textContent=t('err');return;
      }
      var body=t('name')+f.name.value+'\n'+t('org')+f.org.value+'\nE-mail: '+f.email.value+'\n'+t('role')+role+'\n\n'+f.message.value;
      window.location.href='mailto:info@novetech.eu?subject='+encodeURIComponent('NOVETECH – '+role)+'&body='+encodeURIComponent(body);
      msg.textContent=t('ok');
    });
  }
  if($('yr'))$('yr').textContent=new Date().getFullYear();

  /* ---------- hero: cavitation bubbles rising in vertical columns ---------- */
  var cv=$('bubbles');
  if(cv){
    var ctx=cv.getContext('2d'),bs=[],w,h,dpr;
    var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    var size=function(){dpr=Math.min(window.devicePixelRatio||1,2);w=cv.clientWidth;h=cv.clientHeight;cv.width=w*dpr;cv.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)};
    var spawn=function(init){
      var col=Math.floor(Math.random()*6);
      return {x:w*(0.08+col*0.17)+(Math.random()-.5)*w*0.06,y:init?Math.random()*h:h+10,r:1+Math.random()*3.2,v:.25+Math.random()*.8,p:Math.random()*6.28};
    };
    var frame=function(){
      ctx.clearRect(0,0,w,h);
      for(var c=0;c<6;c++){var cx=w*(0.08+c*0.17);var g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(157,220,255,0)');g.addColorStop(1,'rgba(157,220,255,0.05)');ctx.fillStyle=g;ctx.fillRect(cx-w*0.035,0,w*0.07,h)}
      for(var i=0;i<bs.length;i++){
        var b=bs[i];b.y-=b.v;b.p+=.03;var bx=b.x+Math.sin(b.p)*3;
        ctx.beginPath();ctx.arc(bx,b.y,b.r,0,6.283);ctx.strokeStyle='rgba(157,220,255,'+(0.18+b.r/14)+')';ctx.lineWidth=1;ctx.stroke();
        if(b.y<-10)bs[i]=spawn(false);
      }
      if(!reduce)requestAnimationFrame(frame);
    };
    size();var n=Math.round(w*h/9000);for(var i=0;i<n;i++)bs.push(spawn(true));frame();
    window.addEventListener('resize',function(){size();if(reduce)frame()});
  }

  /* ---------- gantt reveal ---------- */
  var gt=document.getElementById('gantt');
  if(gt&&'IntersectionObserver' in window&&!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)){
    gt.classList.add('pending');
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){gt.classList.remove('pending');gt.classList.add('go');
      var b=gt.querySelector('[data-count]'),n=0,t=+b.getAttribute('data-count');var iv=setInterval(function(){n++;b.textContent=n;if(n>=t)clearInterval(iv)},70);
      io.disconnect();}})},{threshold:.35});
    io.observe(gt);
  }
})();
