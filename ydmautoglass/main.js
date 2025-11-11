// ===== YDM Auto Glass - main.js v4 =====
(function(){
  'use strict';
  
  const LS_KEY = 'ydm-lang';
  const prefersES = /^es(-|$)/i.test(navigator.language||'');
  const initial = localStorage.getItem(LS_KEY) || (prefersES ? 'es' : 'en');

  const $ = (s,ctx=document)=>ctx.querySelector(s);
  const $$ = (s,ctx=document)=>Array.from(ctx.querySelectorAll(s));

  function label(lang){return lang==='es'?'ES':'EN'}
  function other(lang){return lang==='es'?'en':'es'}

  function setLang(lang){
    const html=document.documentElement;
    html.classList.remove('lang-en','lang-es');
    html.classList.add(lang==='es'?'lang-es':'lang-en');
    localStorage.setItem(LS_KEY,lang);

    // segmented toggle
    const seg=$('#langSegment');
    if(seg){
      seg.querySelectorAll('button[data-lang]').forEach(b=>{
        const on=b.dataset.lang===lang;
        b.classList.toggle('active',on);
        b.setAttribute('aria-pressed',on?'true':'false');
      });
    }
    refreshWA(lang);
  }
  
  function getLang(){return localStorage.getItem(LS_KEY)||initial}
  function toggleLang(){setLang(other(getLang()))}

  // Build WA message templates (single-language)
  function waTemplate(lang){
    return lang==='es'
      ? 'Hola YDM, por favor cotización:\nNombre: \nTeléfono: \nYMM: \nVidrio: windshield\nZIP: \n(Fotos adjuntas)'
      : 'Hi YDM, quote please:\nName: \nPhone: \nYMM: \nGlass: windshield\nZIP: \n(Photos attached)';
  }
  
  function setWaParams(a,lang){
    try{
      const u=new URL(a.href);
      u.searchParams.delete('text');
      u.searchParams.set('text',waTemplate(lang));
      u.searchParams.set('lang',lang);
      if(a.dataset.wa) u.searchParams.set('source',a.dataset.wa);
      a.href=u.toString(); 
      a.target='_blank'; 
      a.rel='noopener';
    }catch{}
  }
  
  function refreshWA(lang){ 
    $$('a[href^="https://wa.me/"]').forEach(a=>setWaParams(a,lang)); 
  }
  
  function wireWaEarlyRefresh(){
    ['pointerdown','touchstart','mousedown'].forEach(evt=>{
      document.addEventListener(evt, (e)=>{
        const a=e.target.closest && e.target.closest('a[href^="https://wa.me/"]');
        if(!a) return; 
        setWaParams(a,getLang());
      }, {passive:true});
    });
  }

  function highlightActive(){
    const cur=location.pathname.split('/').pop()||'index.html';
    $$('.nav a').forEach(a=>{
      const name=(a.getAttribute('href')||'').split('/').pop()||'index.html';
      if(name===cur || (cur==='index.html' && (name==='/'||name==='./'||name==='index.html'))) {
        a.classList.add('active');
      }
    });
  }

  // Enhanced scroll reveal with staggered animations
  function reveal(){
    const reveals = $$('.reveal');
    if (!reveals.length) return;
    
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Stagger animation for better visual flow
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, index * 50); // 50ms delay between each element
          io.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    
    reveals.forEach(el => io.observe(el));
  }

  function prefetch(){
    const pages=['services.html','contact.html'];
    pages.forEach(p=>{ 
      const l=document.createElement('link'); 
      l.rel='prefetch'; 
      l.href=p; 
      l.as='document'; 
      document.head.appendChild(l); 
      fetch(p,{cache:'force-cache'}).catch(()=>{}); 
    });
    
    // Prefetch critical images
    const imgs=$$('img[loading="lazy"]').slice(0, 6); // First 6 lazy images
    imgs.forEach(img=>{ 
      const src = img.currentSrc || img.src;
      if (src) {
        const l=document.createElement('link'); 
        l.rel='prefetch'; 
        l.href=src; 
        l.as='image'; 
        document.head.appendChild(l); 
      }
    });
  }

  function pageFade(){
    document.body.classList.add('ready');
    document.addEventListener('click',(e)=>{
      const a=e.target.closest('a'); 
      if(!a) return;
      const href=a.getAttribute('href')||'';
      if(/^(tel:|mailto:|https:\/\/wa\.me\/|#)/i.test(href)) return;
      const url=new URL(href,location.href);
      if(url.origin!==location.origin) return;
      e.preventDefault(); 
      document.body.classList.add('fade-out'); 
      setTimeout(()=>{ 
        location.href=url.href 
      },180);
    });
  }

  function year(){ 
    const y=$('#year'); 
    if(y) y.textContent=new Date().getFullYear(); 
  }

  function sw(){ 
    if('serviceWorker' in navigator){ 
      navigator.serviceWorker.register('sw.js?v=5').catch(()=>{}); 
    } 
  }

  function wireLangSegment(){
    const seg=$('#langSegment'); 
    if(!seg) return;
    seg.addEventListener('click', (e)=>{
      const btn=e.target.closest('button[data-lang]'); 
      if(!btn) return;
      setLang(btn.dataset.lang);
    });
  }


  // WhatsApp from contact form
  function wireFormWA(){
    const btn=$('#waPrefillBtn'), form=$('#quoteForm');
    if(!btn||!form) return;
    btn.addEventListener('click', function(){
      const lang=getLang();
      const name=form.elements['name']?.value?.trim()||'';
      const phone=form.elements['phone']?.value?.trim()||'';
      const zip=form.elements['zip']?.value?.trim()||'';
      const ymm=form.elements['ymm']?.value?.trim()||'';
      const glass=form.elements['glass']?.value||'';
      const notes=form.elements['message']?.value?.trim()||'';
      const msg = lang==='es'
        ? ['Hola YDM, por favor cotización:', `Nombre: ${name}`, `Teléfono: ${phone}`, `YMM: ${ymm}`, `Vidrio: ${glass||'windshield'}`, `ZIP: ${zip}`, notes?`Notas: ${notes}`:null, '(Fotos adjuntas)'].filter(Boolean).join('\n')
        : ['Hi YDM, quote please:', `Name: ${name}`, `Phone: ${phone}`, `YMM: ${ymm}`, `Glass: ${glass||'windshield'}`, `ZIP: ${zip}`, notes?`Notes: ${notes}`:null, '(Photos attached)'].filter(Boolean).join('\n');
      this.href=`https://wa.me/19797331769?text=${encodeURIComponent(msg)}&lang=${lang}&source=contact-form`;
    });
  }

  // Contact form success simulation
  function wireContactForm(){
    const form = $('#quoteForm') || $('form[action="#"]');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Show success message
      let successMsg = form.querySelector('.form-success');
      if (!successMsg) {
        successMsg = document.createElement('div');
        successMsg.className = 'form-success';
        successMsg.innerHTML = getLang() === 'es' 
          ? '✓ ¡Gracias! Te contactaremos pronto.'
          : '✓ Thanks! We\'ll reach out shortly.';
        form.appendChild(successMsg);
      }
      
      successMsg.classList.add('show');
      
      // Reset form after delay
      setTimeout(() => {
        form.reset();
        successMsg.classList.remove('show');
      }, 5000);
    });
  }

  // Language toggle button
  function wireLangToggle(){
    const btn = $('#langSwitch');
    if (!btn) return;
    
    btn.addEventListener('click', () => {
      toggleLang();
      btn.textContent = `${label(getLang())} / ${label(other(getLang()))}`;
    });
    
    // Set initial button text
    btn.textContent = `${label(getLang())} / ${label(other(getLang()))}`;
  }

  function init(){
    setLang(getLang());
    wireLangToggle();
    wireLangSegment();
    wireWaEarlyRefresh();
    highlightActive();
    reveal();
    prefetch();
    pageFade();
    year();
    sw();
    wireFormWA();
    wireContactForm();
  }
  
  if(document.readyState==='loading'){ 
    document.addEventListener('DOMContentLoaded', init); 
  } else { 
    init(); 
  }
})();
