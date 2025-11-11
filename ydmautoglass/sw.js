// Service worker v5
const CACHE='ydm-v5';
const CORE=['./','./index.html','./services.html','./contact.html','./style.css','./main.js?v=5'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>
      Promise.all(
        keys.map(k=>k!==CACHE?caches.delete(k):null)
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch',e=>{
  const req=e.request, url=new URL(req.url);
  if(req.method!=='GET' || url.origin!==location.origin) return;
  e.respondWith(
    caches.match(req).then(c=>
      c||fetch(req).then(r=>{
        if(req.destination==='image'){ 
          const copy=r.clone(); 
          caches.open(CACHE).then(cc=>cc.put(req,copy)); 
        }
        return r;
      }).catch(()=>c)
    )
  );
});
