import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root=process.cwd();
const ignored=new Set([".git","node_modules"]);
function walk(dir){
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    if(ignored.has(entry.name))return [];
    const p=path.join(dir,entry.name);
    return entry.isDirectory()?walk(p):[p];
  });
}
const htmlFiles=walk(root).filter(f=>f.endsWith(".html"));
const errors=[],warnings=[];
const rel=f=>path.relative(root,f).replaceAll("\\","/");
function add(arr,file,msg){arr.push(rel(file)+": "+msg)}
for(const file of htmlFiles){
  const html=fs.readFileSync(file,"utf8");
  // IDs and links embedded in JavaScript strings are not DOM markup.
  const markup=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,"");
  for(const [index,match] of [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].entries()){
    try{new vm.Script(match[1],{filename:rel(file)+" inline script "+(index+1)})}
    catch(error){add(errors,file,"inline JavaScript syntax error in script "+(index+1)+": "+error.message)}
  }
  if(!/^<!doctype html>/i.test(markup.trim()))add(errors,file,"missing HTML5 doctype");
  if(!/<html[^>]+lang=["'][^"']+["']/i.test(markup))add(errors,file,"missing html[lang]");
  if(!/<meta[^>]+name=["']viewport["']/i.test(markup))add(errors,file,"missing viewport meta");
  if(!/<title>[^<]+<\/title>/i.test(markup))add(errors,file,"missing non-empty title");
  if(!/<main\b/i.test(markup))add(errors,file,"missing main landmark");
  const imgs=[...markup.matchAll(/<img\b[^>]*>/gi)];
  imgs.forEach(m=>{if(!/\balt=["'][^"']*["']/i.test(m[0]))add(errors,file,"img without alt attribute")});
  const menuBtns=[...markup.matchAll(/<button\b[^>]*class=["'][^"']*menu-button[^"']*["'][^>]*>/gi)];
  menuBtns.forEach(m=>{if(!/aria-label=/i.test(m[0]))add(errors,file,"menu button without aria-label")});
  const ids=[...markup.matchAll(/\bid=["']([^"']+)["']/gi)].map(m=>m[1]);
  const dup=ids.filter((id,i)=>ids.indexOf(id)!==i);
  [...new Set(dup)].forEach(id=>add(errors,file,"duplicate id: "+id));
  for(const m of markup.matchAll(/href=["']([^"']+)["']/gi)){
    let href=m[1];
    if(/^(https?:|mailto:|tel:|javascript:|#)/i.test(href)||href.includes("${"))continue;
    href=href.split("#")[0].split("?")[0];
    if(!href)continue;
    const target=path.resolve(path.dirname(file),href);
    if(!fs.existsSync(target))add(errors,file,"broken internal href: "+m[1]);
  }
  if(/<table\b/i.test(markup)&&!/overflow-x:auto|class=["'][^"']*table/i.test(markup)&&!fs.readFileSync(path.join(root,"styles.css"),"utf8").includes("table{display:block;overflow-x:auto"))add(warnings,file,"table may need mobile overflow review");
}

const scriptPath=path.join(root,"script.js");
if(fs.existsSync(scriptPath)){
  const source=fs.readFileSync(scriptPath,"utf8");
  const manifestStart=source.indexOf("window.CMCurriculo = window.CMCurriculo || {");
  const manifestEnd=source.indexOf("\\n  };",manifestStart);
  if(manifestStart<0||manifestEnd<0){
    errors.push("script.js: curriculum manifest could not be parsed");
  }else{
    const manifest=source.slice(manifestStart,manifestEnd);
    const lessonBlock=manifest.match(/lessons:\\s*\\{([\\s\\S]*?)\\n\\s*\\},\\s*tracks:/);
    const activityBlock=manifest.match(/activities:\\s*\\{([\\s\\S]*?)\\n\\s*\\},\\s*requirements:/);
    const requirementsBlock=manifest.match(/requirements:\\s*\\{([\\s\\S]*?)\\n\\s*\\}/);
    const lessons=new Map(),activities=new Map(),requirements=[];
    if(!lessonBlock||!activityBlock||!requirementsBlock){
      errors.push("script.js: curriculum manifest sections are incomplete");
    }else{
      for(const m of lessonBlock[1].matchAll(/"([^"]+)"\\s*:\\s*\\{\\s*href:"([^"]+)"[\\s\\S]*?practice:"([^"]+)"/g))lessons.set(m[1],{href:m[2],practice:m[3]});
      for(const m of activityBlock[1].matchAll(/"([^"]+)"\\s*:\\s*\\{\\s*href:"([^"]+)"/g))activities.set(m[1],{href:m[2]});
      for(const m of requirementsBlock[1].matchAll(/([a-z]+)\\s*:\\s*\\[([^\\]]*)\\]/g)){
        const ids=[...m[2].matchAll(/"([^"]+)"/g)].map(x=>x[1]);
        requirements.push({track:m[1],ids});
        if(new Set(ids).size!==ids.length)errors.push("script.js: duplicate requirement in track "+m[1]);
        ids.forEach(id=>{if(!lessons.has(id)&&!activities.has(id))errors.push("script.js: unknown curriculum requirement "+id+" in track "+m[1])});
      }
      for(const [id,item] of lessons){
        for(const [kind,href,base] of [["lesson",item.href,root],["practice",item.practice,root]]){
          const target=path.resolve(base,href.split("#")[0].split("?")[0]);
          if(!fs.existsSync(target))errors.push("script.js: broken "+kind+" target for "+id+": "+href);
        }
      }
      for(const [id,item] of activities){
        const target=path.resolve(root,"aprendizado",item.href.split("#")[0].split("?")[0]);
        if(!fs.existsSync(target))errors.push("script.js: broken activity target for "+id+": "+item.href);
      }
      if(requirements.length===0)errors.push("script.js: no curriculum requirements found");
    }
  }
  for(const page of ["aprendizado/trilhas.html","aprendizado/certificado.html"]){
    const file=path.join(root,page);
    if(fs.existsSync(file)&&!fs.readFileSync(file,"utf8").includes("curriculum.requirements"))errors.push(page+": does not consume the central curriculum requirements");
  }
}

console.log("Quality check: "+htmlFiles.length+" HTML files");
warnings.forEach(x=>console.warn("WARN "+x));
if(errors.length){
  errors.forEach(x=>console.error("ERROR "+x));
  process.exit(1);
}
console.log("OK: accessibility/static-link smoke checks passed.");
