const CM_LEARNING_KEY="contextoMercadoLearningProgressV1";
const CM_SCHEMA_KEY="contextoMercadoDataSchemaVersion";
const CM_SCHEMA_VERSION=2;
const CM_DATA_KEYS=[
  "contextoMercadoChecklistV1",
  "contextoMercadoJournalV1",
  "contextoMercadoScenarioAttemptsV1",
  "contextoMercadoPlanVsRealV1",
  "contextoMercadoReplayV1",
  "contextoMercadoGuidedReplayV1",
  "contextoMercadoLearningProgressV1"
];

window.CMData={
  schemaVersion:CM_SCHEMA_VERSION,
  keys:CM_DATA_KEYS.slice(),
  migrate(){
    const previous=Number(localStorage.getItem(CM_SCHEMA_KEY)||"1");
    if(previous<2){
      const arrayKeys=CM_DATA_KEYS.filter(k=>k!==CM_LEARNING_KEY&&k!=="contextoMercadoChecklistV1");
      arrayKeys.forEach(key=>{
        const raw=localStorage.getItem(key);if(raw===null)return;
        try{const parsed=JSON.parse(raw);if(!Array.isArray(parsed))localStorage.removeItem(key)}catch(e){localStorage.removeItem(key)}
      });
      const learning=localStorage.getItem(CM_LEARNING_KEY);
      if(learning!==null){
        try{
          const p=JSON.parse(learning)||{};
          localStorage.setItem(CM_LEARNING_KEY,JSON.stringify({
            completed:p.completed&&typeof p.completed==="object"?p.completed:{},
            scores:p.scores&&typeof p.scores==="object"?p.scores:{},
            certificates:p.certificates&&typeof p.certificates==="object"?p.certificates:{}
          }));
        }catch(e){localStorage.removeItem(CM_LEARNING_KEY)}
      }
    }
    localStorage.setItem(CM_SCHEMA_KEY,String(CM_SCHEMA_VERSION));
    return CM_SCHEMA_VERSION;
  },
  exportAll(){
    const data={};
    CM_DATA_KEYS.forEach(key=>{const v=localStorage.getItem(key);if(v!==null){try{data[key]=JSON.parse(v)}catch(e){data[key]=v}}});
    return {app:"Contexto de Mercado",schemaVersion:CM_SCHEMA_VERSION,exportedAt:new Date().toISOString(),data};
  },
  importAll(payload,mode="merge"){
    if(!payload||payload.app!=="Contexto de Mercado"||!payload.data||typeof payload.data!=="object")throw new Error("backup-invalid");
    if(mode==="replace")CM_DATA_KEYS.forEach(key=>localStorage.removeItem(key));
    CM_DATA_KEYS.forEach(key=>{
      if(!(key in payload.data))return;
      if(mode==="merge"&&localStorage.getItem(key)!==null){
        try{
          const current=JSON.parse(localStorage.getItem(key));
          const incoming=payload.data[key];
          if(Array.isArray(current)&&Array.isArray(incoming)){
            const seen=new Set(),merged=[];
            current.concat(incoming).forEach(item=>{const id=item&&item.id?String(item.id):JSON.stringify(item);if(!seen.has(id)){seen.add(id);merged.push(item)}});
            localStorage.setItem(key,JSON.stringify(merged));return;
          }
          if(key===CM_LEARNING_KEY&&current&&incoming&&typeof current==="object"&&typeof incoming==="object"){
            localStorage.setItem(key,JSON.stringify({
              completed:{...(current.completed||{}),...(incoming.completed||{})},
              scores:{...(current.scores||{}),...(incoming.scores||{})},
              certificates:{...(current.certificates||{}),...(incoming.certificates||{})}
            }));return;
          }
        }catch(e){}
      }
      localStorage.setItem(key,JSON.stringify(payload.data[key]));
    });
    localStorage.setItem(CM_SCHEMA_KEY,String(CM_SCHEMA_VERSION));
    this.migrate();
  },
  clearAll(){CM_DATA_KEYS.concat([CM_SCHEMA_KEY]).forEach(key=>localStorage.removeItem(key))}
};
CMData.migrate();

window.CMLearning={
  load(){
    try{
      const raw=JSON.parse(localStorage.getItem(CM_LEARNING_KEY)||"{}");
      return {
        completed:raw.completed&&typeof raw.completed==="object"?raw.completed:{},
        scores:raw.scores&&typeof raw.scores==="object"?raw.scores:{},
        certificates:raw.certificates&&typeof raw.certificates==="object"?raw.certificates:{}
      };
    }catch(e){return {completed:{},scores:{},certificates:{}}}
  },
  save(data){localStorage.setItem(CM_LEARNING_KEY,JSON.stringify(data))},
  mark(id,meta={}){
    const d=this.load();d.completed[id]={completedAt:new Date().toISOString(),...meta};this.save(d);
    window.dispatchEvent(new CustomEvent("cm-learning-updated",{detail:{id}}));return d;
  },
  unmark(id){const d=this.load();delete d.completed[id];this.save(d);window.dispatchEvent(new CustomEvent("cm-learning-updated",{detail:{id}}));return d},
  isComplete(id){return !!this.load().completed[id]},
  setScore(id,score,meta={}){
    const d=this.load(),prev=d.scores[id];d.scores[id]={score,updatedAt:new Date().toISOString(),...meta};
    if(prev&&Number(prev.score)>Number(score))d.scores[id]=prev;this.save(d);
    window.dispatchEvent(new CustomEvent("cm-learning-updated",{detail:{id}}));return d;
  },
  getScore(id){return this.load().scores[id]||null},
  percent(ids){if(!ids.length)return 0;const d=this.load();return Math.round(ids.filter(id=>d.completed[id]).length/ids.length*100)}
};

function cmRoot(){
  const tag=[...document.scripts].find(s=>/script\.js(?:\?|$)/.test(s.src));
  return tag?new URL("./",tag.src):new URL("./",location.href);
}
function addPwa(){
  const root=cmRoot();
  if(!document.querySelector('link[rel="manifest"]')){
    const link=document.createElement("link");link.rel="manifest";link.href=new URL("manifest.webmanifest",root).href;document.head.appendChild(link);
  }
  if(!document.querySelector('meta[name="theme-color"]')){
    const meta=document.createElement("meta");meta.name="theme-color";meta.content="#071018";document.head.appendChild(meta);
  }
  if("serviceWorker" in navigator&&location.protocol.startsWith("http")){
    navigator.serviceWorker.register(new URL("sw.js",root).href,{scope:root.pathname}).catch(()=>{});
  }
}
function addAccessibility(){
  const main=document.querySelector("main");
  if(main&&!main.id)main.id="conteudo-principal";
  if(main&&!document.querySelector(".skip-link")){
    const skip=document.createElement("a");skip.className="skip-link";skip.href="#"+main.id;
    skip.textContent=document.documentElement.lang==="en"?"Skip to content":document.documentElement.lang==="es"?"Saltar al contenido":"Pular para o conteúdo";
    document.body.prepend(skip);
  }
  document.querySelectorAll("[id=status],[id=summary],[id=filterSummary],[id=eligibility],[id=score]").forEach(el=>{if(!el.hasAttribute("aria-live"))el.setAttribute("aria-live","polite")});
}
function addLanguageLinks(){
  const root=cmRoot(),lang=document.documentElement.lang||"pt-BR",footer=document.querySelector(".footer .container");
  if(!footer||document.querySelector(".language-switcher"))return;
  const nav=document.createElement("nav");nav.className="language-switcher";nav.setAttribute("aria-label",lang==="en"?"Languages":lang==="es"?"Idiomas":"Idiomas");
  nav.innerHTML='<a href="'+new URL("index.html",root).href+'"'+(lang.startsWith("pt")?' aria-current="page"':'')+'>Português</a><a href="'+new URL("en/index.html",root).href+'"'+(lang==="en"?' aria-current="page"':'')+'>English</a><a href="'+new URL("es/index.html",root).href+'"'+(lang==="es"?' aria-current="page"':'')+'>Español</a>';
  footer.appendChild(nav);
}

document.addEventListener("DOMContentLoaded",()=>{
  addPwa();addAccessibility();addLanguageLinks();
  const menu=document.querySelector(".menu-button"),links=document.querySelector(".nav-links");
  if(menu&&links){
    if(!links.id)links.id="menu-principal";
    menu.setAttribute("aria-controls",links.id);menu.setAttribute("aria-expanded","false");
    menu.addEventListener("click",()=>{const open=links.classList.toggle("open");menu.setAttribute("aria-expanded",String(open))});
    links.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{links.classList.remove("open");menu.setAttribute("aria-expanded","false")}));
  }
  document.querySelectorAll("[data-year]").forEach(el=>el.textContent=new Date().getFullYear());

  const path=location.pathname.replace(/\\/g,"/");
  const modules=[
    ["artigos/o-que-e-contexto-de-mercado.html","fund-contexto","Fundamentos: contexto de mercado"],
    ["artigos/regimes-de-mercado.html","fund-regimes","Fundamentos: regimes de mercado"],
    ["artigos/leitura-top-down.html","fund-topdown","Fundamentos: leitura top-down"],
    ["artigos/localizacao-do-preco.html","fund-localizacao","Fundamentos: localização do preço"],
    ["artigos/volatilidade.html","fund-volatilidade","Fundamentos: volatilidade"],
    ["rotina/pre-mercado.html","fund-rotina","Rotina pré-mercado"],
    ["artigos/abertura-e-horarios.html","intraday-horarios","Intraday: abertura e horários"],
    ["artigos/gaps-aceitacao-rejeicao.html","intraday-gaps","Intraday: gaps, aceitação e rejeição"],
    ["artigos/correlacao-intermercado.html","intraday-intermercado","Intraday: correlação e intermercado"],
    ["artigos/eventos-macroeconomicos.html","intraday-macro","Intraday: eventos macroeconômicos"],
    ["artigos/liquidez-volume-agressao.html","fluxo-liquidez","Fluxo: liquidez, volume e agressão"]
  ];
  const hit=modules.find(([suffix])=>path.endsWith(suffix));
  if(hit&&document.documentElement.lang.startsWith("pt")){
    const [,id,label]=hit,footer=document.querySelector(".footer");
    if(footer&&!document.querySelector(".learning-completion")){
      const wrap=document.createElement("section");wrap.className="learning-completion";
      wrap.innerHTML='<div class="container"><div class="learning-completion-box"><div><span class="tag">Progresso da Fase 5</span><h3>'+label+'</h3><p class="muted">Quando terminar esta leitura, marque o módulo como concluído. O progresso fica salvo apenas neste navegador.</p></div><button class="button secondary" type="button" data-learning-complete></button></div></div>';
      footer.before(wrap);const btn=wrap.querySelector("[data-learning-complete]");
      const paint=()=>{const done=CMLearning.isComplete(id);btn.textContent=done?"✓ Módulo concluído":"Marcar como concluído";btn.classList.toggle("learning-done",done)};
      btn.addEventListener("click",()=>{CMLearning.isComplete(id)?CMLearning.unmark(id):CMLearning.mark(id,{label});paint()});paint();
    }
  }
});
