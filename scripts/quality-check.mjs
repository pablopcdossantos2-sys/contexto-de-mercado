import fs from "node:fs";
import path from "node:path";

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
  if(!/^<!doctype html>/i.test(html.trim()))add(errors,file,"missing HTML5 doctype");
  if(!/<html[^>]+lang=["'][^"']+["']/i.test(html))add(errors,file,"missing html[lang]");
  if(!/<meta[^>]+name=["']viewport["']/i.test(html))add(errors,file,"missing viewport meta");
  if(!/<title>[^<]+<\/title>/i.test(html))add(errors,file,"missing non-empty title");
  if(!/<main\b/i.test(html))add(errors,file,"missing main landmark");
  const imgs=[...html.matchAll(/<img\b[^>]*>/gi)];
  imgs.forEach(m=>{if(!/\balt=["'][^"']*["']/i.test(m[0]))add(errors,file,"img without alt attribute")});
  const menuBtns=[...html.matchAll(/<button\b[^>]*class=["'][^"']*menu-button[^"']*["'][^>]*>/gi)];
  menuBtns.forEach(m=>{if(!/aria-label=/i.test(m[0]))add(errors,file,"menu button without aria-label")});
  const ids=[...html.matchAll(/\bid=["']([^"']+)["']/gi)].map(m=>m[1]);
  const dup=ids.filter((id,i)=>ids.indexOf(id)!==i);
  [...new Set(dup)].forEach(id=>add(errors,file,"duplicate id: "+id));
  for(const m of html.matchAll(/href=["']([^"']+)["']/gi)){
    let href=m[1];
    if(/^(https?:|mailto:|tel:|javascript:|#)/i.test(href)||href.includes("${"))continue;
    href=href.split("#")[0].split("?")[0];
    if(!href)continue;
    const target=path.resolve(path.dirname(file),href);
    if(!fs.existsSync(target))add(errors,file,"broken internal href: "+m[1]);
  }
  if(/<table\b/i.test(html)&&!/overflow-x:auto|class=["'][^"']*table/i.test(html)&&!fs.readFileSync(path.join(root,"styles.css"),"utf8").includes("table{display:block;overflow-x:auto"))add(warnings,file,"table may need mobile overflow review");
}
console.log("Quality check: "+htmlFiles.length+" HTML files");
warnings.forEach(x=>console.warn("WARN "+x));
if(errors.length){
  errors.forEach(x=>console.error("ERROR "+x));
  process.exit(1);
}
console.log("OK: accessibility/static-link smoke checks passed.");
