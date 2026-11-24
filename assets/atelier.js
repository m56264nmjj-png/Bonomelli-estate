/* Private Atelier: percorso guidato in otto passi (solo per atelier.html).
   Tutti i testi stanno nell'HTML in due lingue: qui si mostrano, si nascondono e si copiano i nodi,
   così tools/build.py continua a separare le lingue. L'unica chiamata di rete è l'invio della richiesta, quando il visitatore preme il pulsante. */
(function(){
  var at=document.getElementById('at');
  if(!at)return;
  var root=document.documentElement;
  var BASE=(document.currentScript&&document.currentScript.src||'').replace(/assets\/atelier\.js(\?.*)?$/,'');
  var TOTAL=8,KEY='be-atelier';
  var SINGLE={prop:1,cat:1,work:1,stone:1,shelf:1,config:1};
  var S={step:1,prop:null,propOther:'',cat:null,work:null,stone:null,shelf:null,solar:[],config:null,wish:'',w:'',l:'',unknown:false,use:[],useOther:''};

  function $(id){return document.getElementById(id)}
  function all(sel,scope){return Array.prototype.slice.call((scope||at).querySelectorAll(sel))}
  function lang(){return root.lang==='en'?'en':'it'}
  function save(){try{sessionStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
  function load(){try{var d=JSON.parse(sessionStorage.getItem(KEY)||'null');if(d&&typeof d==='object'){for(var k in S){if(Object.prototype.hasOwnProperty.call(d,k)&&typeof d[k]===typeof S[k]||(d[k]===null||typeof d[k]==='string')&&(S[k]===null))S[k]=d[k]}}}catch(e){}}
  function msgNode(k){var m=at.querySelector('#at-msgs [data-msg="'+k+'"]');var s=document.createElement('span');if(m)all('*',m).length?all(':scope > *',m).forEach(function(c){s.appendChild(c.cloneNode(true))}):s.textContent=m.textContent;return s}
  function msgText(k){var m=at.querySelector('#at-msgs [data-msg="'+k+'"]');if(!m)return '';var sp=m.querySelector('[lang="'+lang()+'"]');return (sp||m).textContent.trim()}
  function status(k){var st=$('at-status');st.textContent='';if(k)st.appendChild(msgNode(k))}
  function btns(group){return all('[data-group="'+group+'"]')}
  function picked(group){return btns(group).filter(function(b){return b.getAttribute('aria-pressed')==='true'})}
  function label(b){var l=b.querySelector('.at-l');var s=document.createElement('span');s.className='at-i';if(l)all(':scope > *',l).length?all(':scope > *',l).forEach(function(c){s.appendChild(c.cloneNode(true))}):s.textContent=l.textContent;return s}
  function workBtn(){return S.work?at.querySelector('[data-group="work"][data-work="'+S.work+'"]'):null}
  function paint(){
    ['prop','cat','stone','shelf','config'].forEach(function(g){btns(g).forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-v')===S[g]?'true':'false')})});
    btns('work').forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-work')===S.work?'true':'false')});
    ['solar','use'].forEach(function(g){btns(g).forEach(function(b){b.setAttribute('aria-pressed',S[g].indexOf(b.getAttribute('data-v'))>-1?'true':'false')})});
    $('at-prop-more').hidden=S.prop!=='altro';
    $('at-use-more').hidden=S.use.indexOf('altro')<0;
    $('at-w').disabled=$('at-l').disabled=S.unknown;
  }

  /* immagine grande, con dissolvenza quando cambia */
  function setStage(stage,b){
    if(!b)return;
    var src=BASE+b.getAttribute('data-img'),w=b.getAttribute('data-w'),h=b.getAttribute('data-h');
    var th=b.querySelector('img'),alt=th?th.alt:'';
    var imgs=all('img',stage),cur=stage.querySelector('img.on')||imgs[0];
    if(cur.getAttribute('src')===src)return;
    if(imgs.length<2||!cur.getAttribute('src')){stage.style.aspectRatio=w+' / '+h;cur.width=w;cur.height=h;cur.alt=alt;cur.src=src;return}
    var nxt=imgs[0]===cur?imgs[1]:imgs[0];
    stage.style.aspectRatio=w+' / '+h;
    nxt.width=w;nxt.height=h;nxt.alt=alt;
    var done=false;function swap(){if(done)return;done=true;nxt.classList.add('on');cur.classList.remove('on')}
    nxt.onload=swap;nxt.onerror=swap;nxt.src=src;
    if(nxt.complete&&nxt.naturalWidth)swap();
  }
  function configBtn(){var w=workBtn();if(!w||!S.config)return null;var box=at.querySelector('.at-cfg[data-cfg="'+w.getAttribute('data-cfg')+'"]');return box?box.querySelector('[data-group="config"][data-v="'+S.config+'"]'):null}

  /* che cosa mostra ogni passo */
  function prepare(n){
    var w=workBtn();
    if(n===3){
      var cb=at.querySelector('[data-group="cat"][aria-pressed="true"]'),key=cb?cb.getAttribute('data-cat'):'';var shown=[];btns('work').forEach(function(b){var ok=b.getAttribute('data-cat')===key;b.hidden=!ok;if(ok)shown.push(b)});
      if(shown.length===1&&!S.work){S.work=shown[0].getAttribute('data-work');paint();save()}
    }
    if(n===4&&w)all('.at-mat').forEach(function(m){m.hidden=m.getAttribute('data-mat')!==w.getAttribute('data-mat')});
    if(n===5&&w){
      var cfg=w.getAttribute('data-cfg');
      all('.at-cfg').forEach(function(c){c.hidden=c.getAttribute('data-cfg')!==cfg});
      setStage($('at-stage5'),configBtn()||w);
      all('.at-cfg[data-cfg="'+cfg+'"] [data-img]').forEach(function(b){var i=new Image();i.src=BASE+b.getAttribute('data-img')});
    }
    if(n===7)summary();
  }
  function fill(id,nodes){var el=$(id);el.textContent='';if(!nodes.length)nodes=[msgNode('none')];nodes.forEach(function(x){if(typeof x==='string'){var s=document.createElement('span');s.className='at-i';s.textContent=x;x=s}else x.classList.add('at-i');el.appendChild(x)})}
  function matBox(){var w=workBtn();return w?at.querySelector('.at-mat[data-mat="'+w.getAttribute('data-mat')+'"]'):null}
  function summary(){
    var w=workBtn();if(!w)return;
    all('.at-mat').forEach(function(m){m.hidden=m.getAttribute('data-mat')!==w.getAttribute('data-mat')});
    all('.at-cfg').forEach(function(c){c.hidden=c.getAttribute('data-cfg')!==w.getAttribute('data-cfg')});
    var cb=configBtn();
    setStage($('at-stage7'),cb||w);
    var name=label(w);if(S.cat==='Padiglioni')name.insertBefore(document.createTextNode('Pavilion '),name.firstChild);
    fill('at-s-opera',[name]);
    var p=picked('prop').map(label);if(S.prop==='altro'&&S.propOther.trim())p.push(S.propOther.trim());
    fill('at-s-proprieta',p);
    fill('at-s-categoria',picked('cat').map(label));
    var box=matBox(),m=[];
    if(box){
      all('[data-group="stone"],[data-group="shelf"]',box).forEach(function(b){if(b.getAttribute('aria-pressed')==='true')m.push(label(b))});
      all('.at-list li',box).forEach(function(li){var v=document.createElement('span'),k=li.firstElementChild.cloneNode(true),x=li.lastElementChild.cloneNode(true);k.removeAttribute('class');v.appendChild(k);v.appendChild(document.createTextNode(' · '));v.appendChild(x);m.push(v)});
      all('[data-group="solar"]',box).forEach(function(b){if(b.getAttribute('aria-pressed')==='true')m.push(label(b))});
    }
    if(S.wish.trim())m.push(msgText('wish')+' '+S.wish.trim());
    fill('at-s-materiali',m);
    fill('at-s-configurazione',[cb?label(cb):msgNode('tbd')]);
    var d=[];
    if(S.unknown)d.push(msgNode('unknown'));
    else{var a=num(S.w),b2=num(S.l);if(a)d.push(msgText('width')+' '+fmt(a)+' m');if(b2)d.push(msgText('length')+' '+fmt(b2)+' m')}
    fill('at-s-misure',d);
    var u=picked('use').map(label);if(S.use.indexOf('altro')>-1&&S.useOther.trim())u.push(S.useOther.trim());
    fill('at-s-uso',u);
  }
  function num(v){v=String(v||'').trim().replace(',','.');if(!/^\d{1,3}(\.\d{1,2})?$/.test(v))return null;var n=parseFloat(v);return n>0?n:null}
  function fmt(n){return lang()==='en'?String(n):String(n).replace('.',',')}
  function badNum(v){return String(v||'').trim()!==''&&num(v)===null}

  function ok(n){
    if(n===1)return !!S.prop;
    if(n===2)return !!S.cat;
    if(n===3)return !!workBtn();
    return true;
  }
  function show(n,focus){
    at.setAttribute('data-dir',n<S.step?'back':'fwd');
    S.step=n;prepare(n);
    all('.at-step').forEach(function(s){s.hidden=+s.getAttribute('data-step')!==n});
    $('at-n').textContent=n;
    all('i',$('at-bar')).forEach(function(i,k){i.className=k<n?'on':''});
    $('at-back').disabled=n===1;
    $('at-next').hidden=n===TOTAL;
    status('');save();
    if(focus){
      var top=at.getBoundingClientRect().top+(window.pageYOffset||0)-96;
      window.scrollTo(0,Math.max(0,top));
      var h=$('at-h'+n);if(h){try{h.focus({preventScroll:true})}catch(e){h.focus()}}
    }
  }
  $('at-next').addEventListener('click',function(){
    var n=S.step;
    if(!ok(n)){status('pick');return}
    if(n===6){
      var bw=!S.unknown&&badNum(S.w),bl=!S.unknown&&badNum(S.l);
      $('at-w').setAttribute('aria-invalid',bw?'true':'false');$('at-l').setAttribute('aria-invalid',bl?'true':'false');
      if(bw||bl){status('num');(bw?$('at-w'):$('at-l')).focus();return}
    }
    if(n<TOTAL)show(n+1,true);
  });
  $('at-back').addEventListener('click',function(){if(S.step>1)show(S.step-1,true)});

  /* scelte: carte e pulsanti */
  at.addEventListener('click',function(e){
    var b=e.target.closest('[data-group]');if(!b||!at.contains(b))return;
    var g=b.getAttribute('data-group'),v=b.getAttribute('data-v');
    if(g==='work'){v=b.getAttribute('data-work');if(S.work!==v){S.work=v;S.stone=S.shelf=S.config=null;S.solar=[]}}
    else if(g==='cat'){if(S.cat!==v){S.cat=v;S.work=S.stone=S.shelf=S.config=null;S.solar=[]}}
    else if(g==='prop'){S.prop=v}
    else if(SINGLE[g]){S[g]=S[g]===v?null:v}
    else{var i=S[g].indexOf(v);if(i>-1)S[g].splice(i,1);else S[g].push(v)}
    paint();status('');save();
    if(g==='config'){var w=workBtn();setStage($('at-stage5'),configBtn()||w)}
    if(g==='prop'&&v==='altro')$('at-prop-other').focus();
  });
  [['at-prop-other','propOther'],['at-wish','wish'],['at-w','w'],['at-l','l'],['at-use-other','useOther']].forEach(function(p){
    $(p[0]).addEventListener('input',function(){S[p[1]]=this.value;save()});
  });
  $('at-unknown').addEventListener('change',function(){S.unknown=this.checked;paint();status('');save()});

  /* richiesta: parte solo quando il visitatore preme il pulsante. Il sito invia e basta: non legge niente da JARVIS. */
  var INVIO='https://klxcmojwmjilklfoqzhp.supabase.co/functions/v1/atelier-richiesta';
  var form=$('at-form'),fst=$('at-fstatus'),done=$('at-done');
  function payload(){
    var g=function(id){return $(id).value.trim()};
    var w=workBtn(),box=matBox(),m=[];
    if(box){
      ['stone','shelf'].forEach(function(k){var bs=all('[data-group="'+k+'"]',box);if(!bs.length)return;m.push(S[k]||(k==='stone'?'Pietra da definire':'Ripiani da definire'))});
      all('.at-list li',box).forEach(function(li){m.push(li.getAttribute('data-v'))});
      if(all('[data-group="solar"]',box).length)S.solar.forEach(function(x){m.push(x)});
    }
    if(S.wish.trim())m.push('Desiderio: '+S.wish.trim());
    var uso=S.use.filter(function(x){return x!=='altro'});
    if(S.use.indexOf('altro')>-1)uso.push(S.useOther.trim()?'altro: '+S.useOther.trim():'altro');
    return {
      nome:g('at-nome'),email:g('at-email'),telefono:g('at-tel')||null,luogo:g('at-luogo')||null,
      proprieta:S.prop==='altro'&&S.propOther.trim()?'altro: '+S.propOther.trim():S.prop,
      categoria:S.cat,opera:w?w.getAttribute('data-v'):null,materiali:m,
      configurazione:configBtn()?S.config:null,
      larghezza_m:S.unknown?null:num(S.w),lunghezza_m:S.unknown?null:num(S.l),
      uso:uso,messaggio:g('at-msg')||null,lingua:lang()
    };
  }
  form.addEventListener('submit',function(e){
    e.preventDefault();fst.className='f-msg';fst.textContent='';
    var v=function(id){return $(id).value.trim()},bad=[];
    [['at-nome',v('at-nome').length>=2],['at-email',/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v('at-email'))],['at-privacy',$('at-privacy').checked]].forEach(function(c){$(c[0]).setAttribute('aria-invalid',c[1]?'false':'true');if(!c[1])bad.push(c[0])});
    if(bad.length){fst.classList.add('err');fst.appendChild(msgNode('form'));$(bad[0]).focus();return}
    if(v('at-web')){fst.classList.add('ok');fst.appendChild(msgNode('thanks'));return}
    var d=payload();d.consenso=true;d.website='';
    var bt=$('at-send');bt.disabled=true;fst.classList.add('ok');fst.appendChild(msgNode('sending'));
    var fine=function(ok,k){bt.disabled=false;fst.className='f-msg';fst.textContent='';
      if(ok){form.reset();form.hidden=true;done.hidden=false;done.focus();return}
      fst.classList.add('err');fst.appendChild(msgNode(k||'fail'))};
    fetch(INVIO,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)})
      .then(function(r){if(r.ok)return fine(true);fine(false,r.status===429?'limit':'fail')})
      .catch(function(){fine(false,'fail')});
  });

  /* avvio: riprende le scelte della sessione, se ci sono */
  load();
  if(!Array.isArray(S.solar))S.solar=[];if(!Array.isArray(S.use))S.use=[];
  $('at-prop-other').value=S.propOther;$('at-wish').value=S.wish;$('at-w').value=S.w;$('at-l').value=S.l;$('at-use-other').value=S.useOther;$('at-unknown').checked=!!S.unknown;
  paint();
  var start=Math.min(Math.max(parseInt(S.step,10)||1,1),TOTAL);
  for(var k=1;k<start;k++){if(!ok(k)){start=k;break}}
  show(start,false);
})();
