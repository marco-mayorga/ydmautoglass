// ===== YDM Auto Glass - main.js v1 (enhanced) =====
(function(){
  'use strict';
  
  // ---------- Language ----------
  const LS_KEY = 'ydm-lang';
  const prefersES = /^es(-|$)/i.test(navigator.language||'');
  const initial = localStorage.getItem(LS_KEY) || (prefersES ? 'es' : 'en');

  const $ = (s,ctx=document)=>ctx.querySelector(s);
  const $$ = (s,ctx=document)=>Array.from(ctx.querySelectorAll(s));

  function label(lang){return lang==='es'?'ES':'EN'}
  function other(lang){return lang==='es'?'en':'es'}
  function getLang(){ return localStorage.getItem(LS_KEY) || initial }

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

    // Update placeholders (inputs/textareas) to current language
    updatePlaceholders(lang);

    // Update WhatsApp links to current language
    updateAllWaLinks();
  }

  function toggleLang(){ setLang(other(getLang())) }

  // ---------- WhatsApp (single source of truth) ----------
  const WA_PHONE = "13462459543"; // primary number: 346-245-9543
  const WA_MSG = {
    en:
      "Hi YDM, quote please:\n" +
      "Name:\nPhone:\nYear/Make/Model:\nGlass: windshield\nZIP: ____\n(Photos attached)",
    es:
      "Hola YDM, por favor cotización:\n" +
      "Nombre:\nTeléfono:\nAño/Marca/Modelo:\nVidrio: windshield\nZIP: ____\n(Fotos adjuntas)",
  };

  const GLASS_LABEL = {
    en: {
      windshield: 'windshield',
      side: 'side glass',
      rear: 'rear glass',
      quarter: 'quarter glass',
      other: 'other / not sure'
    },
    es: {
      windshield: 'parabrisas',
      side: 'vidrio lateral',
      rear: 'vidrio trasero',
      quarter: 'ventana pequeña (quarter glass)',
      other: 'otro / no estoy seguro'
    }
  };

  function updatePlaceholders(lang){
    const key = lang === 'es' ? 'phEs' : 'phEn';
    const fallbackKey = lang === 'es' ? 'phEn' : 'phEs';
    $$('[data-ph-es][data-ph-en]').forEach(el=>{
      const ds = el.dataset;
      const val = ds[key] || ds[fallbackKey] || el.placeholder || '';
      if (val) el.placeholder = val;
    });
  }

  function currentLang(){
    // Prefer our stored lang; fall back to html class/attr
    const ls = getLang();
    if (ls) return ls;
    const html = document.documentElement;
    if (html.classList.contains("lang-en")) return "en";
    if (html.classList.contains("lang-es")) return "es";
    const attr = (html.getAttribute("lang") || "en").toLowerCase();
    return attr.startsWith("es") ? "es" : "en";
  }

  function setWaParams(a, lang){
    try{
      const base = `https://wa.me/${WA_PHONE}`;
      const url = new URL(a.href.startsWith("http") ? a.href : base, location.href);
      url.pathname = `/`;
      url.host = `wa.me`;
      url.protocol = `https:`;
      url.pathname += WA_PHONE; // ensure correct phone

      // message
      url.searchParams.set("text", WA_MSG[lang]);

      // optional source tracking
      if (a.dataset.wa) url.searchParams.set("source", a.dataset.wa);
      url.searchParams.set("lang", lang);

      a.href = url.toString();
      a.target = '_blank';
      a.rel = 'noopener';
    }catch{}
  }

  function updateAllWaLinks(){
    const lang = currentLang();
    const links = document.querySelectorAll(
      'a[data-wa], a.whats, a.btn.whats, a.floating-wa, a[href^="https://wa.me/"]'
    );
    links.forEach(a => setWaParams(a, lang));
  }

  // Early refresh so the right lang is set on first tap
  function wireWaEarlyRefresh(){
    ['pointerdown','touchstart','mousedown'].forEach(evt=>{
      document.addEventListener(evt, (e)=>{
        const a=e.target.closest && e.target.closest('a[href^="https://wa.me/"]');
        if(!a) return; 
        setWaParams(a,currentLang());
      }, {passive:true});
    });
  }

  // ---------- Nav active ----------
  function highlightActive(){
    const cur=location.pathname.split('/').pop()||'index.html';
    $$('.nav a').forEach(a=>{
      const name=(a.getAttribute('href')||'').split('/').pop()||'index.html';
      if(name===cur || (cur==='index.html' && (name==='/'||name==='./'||name==='index.html'))) {
        a.classList.add('active');
      }
    });
  }

  // ---------- Reveal ----------
  function reveal(){
    const reveals = $$('.reveal');
    if (!reveals.length) return;
    
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, index * 40);
          io.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    
    reveals.forEach(el => io.observe(el));
  }

  // ---------- Prefetch ----------
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

    const imgs=$$('img[loading="lazy"]').slice(0, 6);
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

  // ---------- Page fade ----------
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
      setTimeout(()=>{ location.href=url.href },180);
    });
  }

  // ---------- Footer year ----------
  function year(){ 
    const y=$('#year'); 
    if(y) y.textContent=new Date().getFullYear(); 
  }

  // ---------- Service worker ----------
  // function sw(){ 
  //   if('serviceWorker' in navigator){ 
  //     navigator.serviceWorker.register('sw.js?v=1', { updateViaCache: 'none' }).catch(()=>{}); 
  //   } 
  // }

  // ---------- Service worker ----------
// Temporarily disabled while we keep tweaking the site
function sw() {
  if ('serviceWorker' in navigator) {
    // Unregister any existing workers so you don't see stale CSS/HTML
    navigator.serviceWorker.getRegistrations()
      .then(regs => regs.forEach(reg => reg.unregister()))
      .catch(() => {});
  }
  // Intentionally NOT registering sw.js for now
  // If you want it back later, you can add the registration here again.
  // navigator.serviceWorker.register('sw.js?v=1', { updateViaCache: 'none' }).catch(()=>{});
}

  // ---------- Language segmented control ----------
  function wireLangSegment(){
    const seg=$('#langSegment'); 
    if(!seg) return;
    seg.addEventListener('click', (e)=>{
      const btn=e.target.closest('button[data-lang]'); 
      if(!btn) return;
      setLang(btn.dataset.lang);
    });
  }

  // ---------- Contact form → WhatsApp prefill ----------
  function wireFormWA(){
    const btn=$('#waPrefillBtn'), form=$('#quoteForm');
    if(!btn||!form) return;
    btn.addEventListener('click', function(){
      const lang=currentLang();
      const name=form.elements['name']?.value?.trim()||'';
      const phone=form.elements['phone']?.value?.trim()||'';
      const zip=form.elements['zip']?.value?.trim()||'';
      const ymm=form.elements['ymm']?.value?.trim()||'';
      const glassRaw=form.elements['glass']?.value||'';
      const notes=form.elements['message']?.value?.trim()||'';

      const glassLabel = (GLASS_LABEL[lang] && GLASS_LABEL[lang][glassRaw]) 
        || glassRaw 
        || (lang==='es' ? 'no especificado' : 'not specified');

      const lines = lang==='es'
        ? [
            'Hola YDM, por favor cotización:',
            `Nombre: ${name || '—'}`, 
            `Teléfono: ${phone || '—'}`,
            '',
            'Detalles del vehículo:',
            `YMM: ${ymm || '—'}`,
            `Vidrio: ${glassLabel}`,
            `ZIP: ${zip || '—'}`,
            notes ? '' : null,
            notes ? `Notas: ${notes}` : null,
            '',
            '(Fotos adjuntas)'
          ]
        : [
            'Hi YDM, quote please:',
            `Name: ${name || '—'}`, 
            `Phone: ${phone || '—'}`,
            '',
            'Vehicle details:',
            `YMM: ${ymm || '—'}`,
            `Glass: ${glassLabel}`,
            `ZIP: ${zip || '—'}`,
            notes ? '' : null,
            notes ? `Notes: ${notes}` : null,
            '',
            '(Photos attached)'
          ];

      const msg = lines.filter(Boolean).join('\n');
      this.href=`https://wa.me/${WA_PHONE}?text=${encodeURIComponent(msg)}&lang=${lang}&source=contact-form`;
    });
  }

  // ---------- Live validation + contact form success ----------
  function setupLiveValidation(form){
    const fields = form.querySelectorAll('input[required], textarea[required], select[required]');
    if (!fields.length) return;
    fields.forEach((field) => {
      const validate = () => {
        let isValid = true;
        if (field.tagName === 'SELECT') {
          isValid = !!field.value;
        } else if ('value' in field) {
          isValid = field.value.trim() !== '';
        }
        field.classList.toggle('field-error', !isValid);
      };
      field.addEventListener('blur', validate);
      field.addEventListener('input', validate);
      if (field.tagName === 'SELECT') {
        field.addEventListener('change', validate);
      }
    });
  }

  function wireContactForm(){
    const form = $('#quoteForm') || $('form[action="#"]');
    if (!form) return;

    // Live validation while the user types
    setupLiveValidation(form);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let successMsg = form.querySelector('.form-success');
      if (!successMsg) {
        successMsg = document.createElement('div');
        successMsg.className = 'form-success';
        successMsg.innerHTML = currentLang() === 'es' 
          ? '✓ ¡Gracias! Te contactaremos pronto.'
          : '✓ Thanks! We\'ll reach out shortly.';
        form.appendChild(successMsg);
      }
      successMsg.classList.add('show');
      setTimeout(() => {
        form.reset();
        successMsg.classList.remove('show');
      }, 5000);
    });
  }

  // ---------- Top-right ES/EN button ----------
  function wireLangToggle(){
    const btn = $('#langSwitch');
    if (!btn) return;
    btn.addEventListener('click', () => {
      toggleLang();
      btn.textContent = `${label(getLang())} / ${label(other(getLang()))}`;
    });
    btn.textContent = `${label(getLang())} / ${label(other(getLang()))}`;
  }

  // Auto-highlight current page in nav
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".nav a");

  navLinks.forEach(link => {
    const linkHref = link.getAttribute("href");

    // Match: index.html or "./" for home
    const isHome =
      (path === "" || path === "index.html") &&
      (linkHref === "./" || linkHref === "index.html");

    // Match: services.html, contact.html, etc.
    const isMatch = linkHref === path;

    if (isHome || isMatch) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
});

function highlightActive(){
  const cur = location.pathname.split('/').pop() || 'index.html';
  $$('.nav a').forEach(a => {
    const name = (a.getAttribute('href') || '').split('/').pop() || 'index.html';
    const isActive =
      name === cur ||
      (cur === 'index.html' && (name === '/' || name === './' || name === 'index.html'));

    a.classList.toggle('active', isActive);
    if (isActive) {
      a.setAttribute('aria-current', 'page');
    } else {
      a.removeAttribute('aria-current');
    }
  });
}

  // ---------- Init ----------
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

