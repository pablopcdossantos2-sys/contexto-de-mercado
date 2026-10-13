# Acessibilidade e revisão responsiva

A Fase 7 incorporou requisitos de acessibilidade diretamente à infraestrutura compartilhada do projeto.

## Melhorias implementadas

- link de salto para o conteúdo principal em todas as páginas que carregam `script.js`;
- foco de teclado claramente visível com `:focus-visible`;
- estado `aria-expanded` e `aria-controls` no menu mobile;
- regiões de resultado dinâmico com `aria-live="polite"`;
- alvos de toque com altura mínima de 44 px;
- suporte a `prefers-reduced-motion`;
- reforço de contraste em `prefers-contrast: more`;
- formulários com fonte mínima de 16 px em telas pequenas para evitar zoom involuntário;
- tabelas com rolagem horizontal controlada em telas estreitas;
- cards, textos e matrizes com quebra de conteúdo para evitar overflow;
- navegação mobile com altura limitada e rolagem própria.

## Teste automatizado sem dependências

Execute:

```bash
node scripts/quality-check.mjs
```

O script verifica todas as páginas HTML e falha quando encontra, entre outros:

- ausência de `<!doctype html>`;
- ausência de atributo `lang`;
- ausência de viewport;
- título vazio;
- ausência de `main`;
- imagens sem `alt`;
- botão de menu sem rótulo acessível;
- IDs duplicados;
- links internos apontando para arquivos inexistentes.

O workflow `.github/workflows/quality.yml` executa esse teste em pushes e pull requests para `main`.

## Revisão manual recomendada

O teste estático não substitui uma revisão visual e com tecnologias assistivas. Antes de releases maiores, testar:

1. navegação completa apenas pelo teclado;
2. zoom do navegador em 200%;
3. viewport estreito (aprox. 320 px);
4. leitor de tela nas páginas com formulários e feedback dinâmico;
5. modo de alto contraste do sistema;
6. preferência de movimento reduzido;
7. instalação do PWA e navegação offline.

## Escopo

O objetivo é reduzir barreiras e impedir regressões óbvias. Esta documentação não afirma conformidade formal certificada com WCAG.
