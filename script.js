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
  "contextoMercadoPrePregaoWinWdoV1",
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
  // Manifesto único do currículo: IDs de progresso, artigos, trilhas e prática sugerida.
  window.CMCurriculo = window.CMCurriculo || {
    lessons: {
      "fund-contexto": { href:"artigos/o-que-e-contexto-de-mercado.html", label:"Fundamentos: contexto de mercado", track:"iniciante", practice:"aprendizado/informacao-ruido.html" },
      "fund-regimes": { href:"artigos/regimes-de-mercado.html", label:"Fundamentos: regimes de mercado", track:"iniciante", practice:"aprendizado/classificacao-regimes.html" },
      "fund-topdown": { href:"artigos/leitura-top-down.html", label:"Fundamentos: leitura top-down", track:"iniciante", practice:"ferramentas/checklist-contexto.html#secao-quadro-maior" },
      "fund-localizacao": { href:"artigos/localizacao-do-preco.html", label:"Fundamentos: localização do preço", track:"iniciante", practice:"ferramentas/checklist-contexto.html#secao-referencias" },
      "fund-volatilidade": { href:"artigos/volatilidade.html", label:"Fundamentos: volatilidade", track:"iniciante", practice:"ferramentas/volatilidade-historica-winfut-wdofut.html" },
      "fund-rotina": { href:"rotina/pre-mercado.html", label:"Rotina pré-mercado", track:"iniciante", practice:"ferramentas/checklist-contexto.html#secao-ambiente" },
      "intraday-horarios": { href:"artigos/abertura-e-horarios.html", label:"Intraday: abertura e horários", track:"intraday", practice:"ferramentas/checklist-contexto.html#secao-ambiente" },
      "intraday-gaps": { href:"artigos/gaps-aceitacao-rejeicao.html", label:"Intraday: gaps, aceitação e rejeição", track:"intraday", practice:"ferramentas/laboratorio-cenarios.html" },
      "intraday-intermercado": { href:"artigos/correlacao-intermercado.html", label:"Intraday: correlação e intermercado", track:"intraday", practice:"ferramentas/laboratorio-cenarios.html" },
      "intraday-macro": { href:"artigos/eventos-macroeconomicos.html", label:"Intraday: eventos macroeconômicos", track:"intraday", practice:"ferramentas/checklist-contexto.html#secao-ambiente" },
      "fluxo-liquidez": { href:"artigos/liquidez-volume-agressao.html", label:"Fluxo: liquidez, volume e agressão", track:"fluxo", practice:"ferramentas/laboratorio-cenarios.html" }
    },
    tracks: {
      iniciante:["fund-contexto","fund-regimes","fund-topdown","fund-localizacao","fund-volatilidade","fund-rotina"],
      intraday:["intraday-horarios","intraday-gaps","intraday-intermercado","intraday-macro"],
      fluxo:["fluxo-liquidez","intraday-gaps","fund-localizacao"]
    }
  };
  const modules=Object.entries(window.CMCurriculo.lessons).map(([id,lesson])=>[lesson.href,id,lesson.label]);
  const hit=modules.find(([suffix])=>path.endsWith(suffix));
  if(hit&&document.documentElement.lang.startsWith("pt")){
    const [,id,label]=hit,footer=document.querySelector(".footer");
    if(footer&&!document.querySelector(".learning-completion")){
      const wrap=document.createElement("section");wrap.className="learning-completion";
      wrap.innerHTML='<div class="container"><div class="learning-completion-box"><div><span class="tag">Progresso da Fase 5</span><h3>'+label+'</h3><p class="muted">Quando terminar esta leitura, marque o módulo como concluído. O progresso fica salvo apenas neste navegador.</p></div><button class="button secondary" type="button" data-learning-complete></button></div></div>';
      footer.before(wrap);const btn=wrap.querySelector("[data-learning-complete]");
      const paint=()=>{const done=CMLearning.isComplete(id);btn.textContent=done?"✓ Módulo concluído":"Marcar como concluído";btn.classList.toggle("learning-done",done)};
      btn.addEventListener("click",()=>{CMLearning.isComplete(id)?CMLearning.unmark(id):CMLearning.mark(id,{label});paint()});paint();
      const current=window.CMCurriculo.lessons[id],trackIds=window.CMCurriculo.tracks[current.track]||[],index=trackIds.indexOf(id);
      if(index>=0&&trackIds.length>1){
        const nav=document.createElement("nav");nav.className="actions curriculum-nav";nav.setAttribute("aria-label","Navegação da trilha");
        const addLink=(lessonId,text)=>{const lesson=window.CMCurriculo.lessons[lessonId];if(!lesson)return;const a=document.createElement("a");a.className="button secondary";a.href=new URL(lesson.href,cmRoot()).href;a.textContent=text+": "+lesson.label;nav.appendChild(a)};
        if(index>0)addLink(trackIds[index-1],"← Anterior");
        if(index<trackIds.length-1)addLink(trackIds[index+1],"Próximo →");
        const container=wrap.querySelector(".container");if(container)container.appendChild(nav);
      }
    }
  }
});
