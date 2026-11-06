# Biblioteki zewnętrzne

| Plik | Biblioteka | Wersja | Licencja |
|---|---|---|---|
| `marked.umd.js` | [marked](https://github.com/markedjs/marked) | 18.0.10 | MIT |
| `purify.min.js` | [DOMPurify](https://github.com/cure53/DOMPurify) | 3.4.14 | Apache-2.0 lub MPL-2.0 |
| `highlight.min.js` | [highlight.js](https://github.com/highlightjs/highlight.js) – rdzeń + języki: cpp, csharp, java, python, javascript, typescript, kotlin, sql, xml, css, bash, json | 11.12.0 | BSD-3-Clause |
| `react.min.js` | [React](https://github.com/facebook/react) + ReactDOM (paczka zbudowana esbuildem, globalne `React`/`ReactDOM`) – tylko w Pracowni GUI i arkuszach | 19.2.8 | MIT |
| `typescript.min.js`, `ts-libs.json`, `ts-pl.json` | [TypeScript](https://github.com/microsoft/TypeScript) – kompilator (transpilacja TS/TSX/JSX i sprawdzanie typów), deklaracje bibliotek standardowych i polskie komunikaty diagnostyczne | 6.0.3 | Apache-2.0 |

Ładowane z CDN (tylko w SQL Lab):

| Adres | Biblioteka | Wersja | Licencja |
|---|---|---|---|
| `cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/` | [sql.js](https://github.com/sql-js/sql.js) (SQLite skompilowany do WebAssembly) | 1.10.3 | MIT (SQLite – domena publiczna) |

Nagłówki licencyjne pozostawiono w plikach bibliotek. Punkt wejścia paczki TypeScript: `tools/ts-bundle-entry.js`.
