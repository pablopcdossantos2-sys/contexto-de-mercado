import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

const html=fs.readFileSync("ferramentas/volatilidade-historica-winfut-wdofut.html","utf8");
const numeric=html.match(/function detectDecimal\(rows\)[\s\S]*?function setStatus/);
assert.ok(numeric,"numeric parser functions must exist");
const context={};
const helpers=vm.runInNewContext(numeric[0].replace(/function setStatus[\s\S]*$/,""),context);
context.decimal=",";
assert.equal(helpers.number("210.800"),210800);
assert.equal(helpers.number("5.080,500"),5080.5);
assert.equal(helpers.number("123.814.402.975,00"),123814402975);
context.decimal=".";
assert.equal(helpers.number("5,080.500"),5080.5);
assert.equal(helpers.detectDecimal([["Data","Máximo"],["16/10/2026","5.080,500"]]),",");

const readMatch=html.match(/async function readText\(file\)\{[\s\S]*?\nfunction setStatus/);
assert.ok(readMatch,"encoding fallback must exist");
const readSource=readMatch[0].replace(/\nfunction setStatus[\s\S]*$/,"");
const readContext={TextDecoder};
vm.runInNewContext(readSource,readContext);
const latin1=Buffer.from("Ativo;Máximo\nWDOFUT;5.080,500","latin1");
const decoded=await readContext.readText(new Blob([latin1]));
assert.match(decoded,/Máximo/);
assert.match(decoded,/5\.080,500/);

for(const path of ["ferramentas/diario-contexto.html","ferramentas/replay-contexto.html","ferramentas/replay-guiado.html"]){
 const page=fs.readFileSync(path,"utf8");
 assert.match(page,/function esc\(value\)/,path+" must escape user-controlled content");
}
console.log("Regression checks passed: Brazilian numbers, Windows-1252 decoding and HTML escaping.");
