const CM_LEARNING_KEY="contextoMercadoLearningProgressV1";

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
    const d=this.load();
    d.completed[id]={completedAt:new Date().toISOString(),...meta};
    this.save(d);
    window.dispatchEvent(new CustomEvent("cm-learning-updated",{detail:{id}}));
    return d;
  },
  unmark(id){
    const d=this.load();
    delete d.completed[id];
    this.save(d);
    window.dispatchEvent(new CustomEvent("cm-learning-updated",{detail:{id}}));
    return d;
  },
  isComplete(id){return !!this.load().completed[id]},
  setScore(id,score,meta={}){
    const d=this.load();
    const prev=d.scores[id];
    d.scores[id]={score,updatedAt:new Date().toISOString(),...meta};
    if(prev&&Number(prev.score)>Number(score))d.scores[id]=prev;
    this.save(d);
    window.dispatchEvent(new CustomEvent("cm-learning-updated",{detail:{id}}));
    return d;
  },
  getScore(id){return this.load().scores[id]||null},
  percent(ids){
    if(!ids.length)return 0;
    const d=this.load();
    return Math.round(ids.filter(id=>d.completed[id]).length/ids.length*100);
  }
};

document.addEventListener("DOMContentLoaded",()=>{
  const menu=document.querySelector(".menu-button");
  const links=document.querySelector(".nav-links");
  if(menu&&links)menu.addEventListener("click",()=>links.classList.toggle("open"));
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
  if(hit){
    const [,id,label]=hit;
    const footer=document.querySelector(".footer");
    if(footer&&!document.querySelector(".learning-completion")){
      const wrap=document.createElement("section");
      wrap.className="learning-completion";
      wrap.innerHTML='<div class="container"><div class="learning-completion-box"><div><span class="tag">Progresso da Fase 5</span><h3>'+label+'</h3><p class="muted">Quando terminar esta leitura, marque o módulo como concluído. O progresso fica salvo apenas neste navegador.</p></div><button class="button secondary" type="button" data-learning-complete></button></div></div>';
      footer.before(wrap);
      const btn=wrap.querySelector("[data-learning-complete]");
      const paint=()=>{
        const done=window.CMLearning.isComplete(id);
        btn.textContent=done?"✓ Módulo concluído":"Marcar como concluído";
        btn.classList.toggle("learning-done",done);
      };
      btn.addEventListener("click",()=>{window.CMLearning.isComplete(id)?window.CMLearning.unmark(id):window.CMLearning.mark(id,{label});paint()});
      paint();
    }
  }
});