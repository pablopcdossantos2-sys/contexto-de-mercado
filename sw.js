const CACHE="contexto-mercado-v7-7";
const CORE=["./","./index.html","./styles.css","./script.js","./manifest.webmanifest","./icons/icon-192.svg","./icons/icon-512.svg","./offline.html","./biblioteca.html","./aprendizado/trilhas.html","./rotina/leitura-pre-pregao-winfut-wdofut.html","./ferramentas/volatilidade-historica-winfut-wdofut.html","./ferramentas/diario-contexto.html","./ferramentas/replay-contexto.html","./ferramentas/replay-guiado.html","./ferramentas/painel-processo.html","./privacidade.html","./ferramentas/gerenciar-dados.html","./en/index.html","./en/course.html","./en/pre-market.html","./en/tools.html","./en/privacy.html","./es/index.html","./es/course.html","./es/pre-market.html","./es/tools.html","./es/privacy.html"];
const url=p=>new URL(p,self.location.href).href;
self.addEventListener("install",event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE.map(url))).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
 const req=event.request;
 if(req.method!=="GET"||new URL(req.url).origin!==self.location.origin)return;
 event.respondWith(
   caches.match(req).then(hit=>{
     const network=fetch(req).then(res=>{
       if(res&&res.ok){const copy=res.clone();caches.open(CACHE).then(cache=>cache.put(req,copy))}
       return res;
     }).catch(()=>null);
     return hit||network.then(res=>res||caches.match(url("./offline.html")));
   })
 );
});
