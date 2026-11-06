import ts from 'typescript';

let libFiles = null;

function setup(libs, plMessages) {
  libFiles = libs;
  if (plMessages && ts.setLocalizedDiagnosticMessages) ts.setLocalizedDiagnosticMessages(plMessages);
}

const EXTRA = 'lib.inf04.d.ts';
const EXTRA_SRC = 'declare var console: { log(...data: any[]): void; info(...data: any[]): void; warn(...data: any[]): void; error(...data: any[]): void; table(...data: any[]): void };';

function lineCol(text, pos) {
  const before = text.slice(0, pos).split('\n');
  return { line: before.length, col: before[before.length - 1].length + 1 };
}

/** Pełne sprawdzenie typów (bez DOM) + transpilacja do JS. */
function check(code, fileName = 'main.ts') {
  const options = {
    target: ts.ScriptTarget.ES2017,
    module: ts.ModuleKind.None,
    ignoreDeprecations: '6.0',
    strict: true,
    noEmit: true,
    lib: ['lib.es2017.d.ts'],
    noImplicitAny: true,
    types: [],
  };
  const files = { [fileName]: code, [EXTRA]: EXTRA_SRC, ...(libFiles || {}) };
  const host = {
    getSourceFile: (name, lang) => (name in files ? ts.createSourceFile(name, files[name], lang) : undefined),
    getDefaultLibFileName: () => 'lib.es2017.d.ts',
    writeFile: () => {},
    getCurrentDirectory: () => '/',
    getDirectories: () => [],
    fileExists: (name) => name in files,
    readFile: (name) => files[name],
    getCanonicalFileName: (n) => n,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => '\n',
  };
  const program = ts.createProgram([fileName, EXTRA], options, host);
  const diags = [...program.getSyntacticDiagnostics(), ...program.getSemanticDiagnostics()]
    .filter((d) => !d.file || d.file.fileName === fileName)
    .map((d) => ({
      message: ts.flattenDiagnosticMessageText(d.messageText, '\n'),
      code: d.code,
      ...(d.file && d.start != null ? lineCol(code, d.start) : {}),
    }));
  return diags;
}

function transpile(code, fileName = 'main.ts') {
  const out = ts.transpileModule(code, {
    fileName,
    reportDiagnostics: true,
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext, ignoreDeprecations: '6.0', jsx: ts.JsxEmit.React, isolatedModules: false },
  });
  return {
    code: out.outputText.replace(/^"use strict";\s*/, '').replace(/^export \{\};?\s*$/m, ''),
    diagnostics: (out.diagnostics || []).map((d) => ({ message: ts.flattenDiagnosticMessageText(d.messageText, '\n'), ...(d.start != null ? lineCol(code, d.start) : {}) })),
  };
}

const api = { setup, check, transpile, version: ts.version };
globalThis.tsLab = api;
export default api;
