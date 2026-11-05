// =========================================================
// DOM CHECKER – automatyczne testy stron w izolowanym <iframe sandbox>
//  Kod użytkownika działa bez dostępu do tej strony (brak allow-same-origin).
//  Testy wykonuje skrypt wstrzyknięty do iframe, a wyniki wracają przez postMessage.
// =========================================================

/** Skrypt przechwytujący console.log i błędy – wstawiany PRZED kodem użytkownika. */
function preludeScript(token) {
  return `<script>(function(){
  var T=${JSON.stringify(token)};
  function send(kind,args){try{parent.postMessage({type:'inf04-log',token:T,kind:kind,text:Array.prototype.map.call(args,function(a){try{return typeof a==='object'?JSON.stringify(a):String(a)}catch(e){return String(a)}}).join(' ')},'*')}catch(e){}}
  ['log','info','warn','error'].forEach(function(k){var o=console[k];console[k]=function(){send(k,arguments);o&&o.apply(console,arguments)}});
  window.addEventListener('error',function(e){send('error',[e.message+(e.lineno?' (linia '+e.lineno+')':'')])});
  window.alert=function(m){send('info',['alert: '+m])};
})();<\/script>`;
}

/** Skrypt wykonujący testy – wstawiany NA KOŃCU dokumentu. */
function checkerScript(token, checks) {
  return `<script>(function(){
  var T=${JSON.stringify(token)};
  var CHECKS=${JSON.stringify(checks).replace(/</g, '\\u003c')};
  function $(s){return document.querySelector(s)}
  function txt(el){return (el.value!==undefined&&el.tagName!=='BUTTON'&&el.tagName!=='LI'&&el.tagName!=='OPTION'?el.value:el.textContent).replace(/\\s+/g,' ').trim()}
  function norm(s){return String(s).replace(/\\s+/g,' ').trim().toLowerCase()}
  function wait(ms){return new Promise(function(r){setTimeout(r,ms)})}
  async function runStep(st){
    if(st.wait){await wait(st.wait);return null}
    var sel=st.exists||st.set||st.check||st.click||st.select||st.expectText||st.expectAttr||st.expectStyle||st.expectValue||st.expectCount||st.expectMissing;
    if(st.expectCount){var n=document.querySelectorAll(sel).length;return n===st.equals?null:'Oczekiwano '+st.equals+' elementów „'+sel+'”, jest '+n}
    if(st.expectMissing){return $(sel)?'Element „'+sel+'” nie powinien istnieć':null}
    var el=$(sel);
    if(!el)return 'Brak elementu „'+sel+'”';
    if(st.exists){if(st.tag&&el.tagName.toLowerCase()!==st.tag)return '„'+sel+'” powinien być znacznikiem <'+st.tag+'>, jest <'+el.tagName.toLowerCase()+'>';if(st.type&&(el.getAttribute('type')||'').toLowerCase()!==st.type)return '„'+sel+'” powinien mieć type="'+st.type+'"';return null}
    if(st.set!==undefined&&st.value!==undefined){el.value=st.value;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));return null}
    if(st.check){el.checked=st.checked!==false;el.dispatchEvent(new Event('change',{bubbles:true}));el.dispatchEvent(new Event('input',{bubbles:true}));return null}
    if(st.select){el.value=st.value;el.dispatchEvent(new Event('change',{bubbles:true}));return null}
    if(st.click){el.click();await wait(30);return null}
    if(st.expectText){var t=txt(el);
      if(st.equals!==undefined&&norm(t)!==norm(st.equals))return '„'+sel+'”: oczekiwano „'+st.equals+'”, jest „'+t+'”';
      if(st.contains!==undefined&&norm(t).indexOf(norm(st.contains))===-1)return '„'+sel+'” powinien zawierać „'+st.contains+'”, jest „'+t+'”';
      if(st.notContains!==undefined&&norm(t).indexOf(norm(st.notContains))!==-1)return '„'+sel+'” nie powinien zawierać „'+st.notContains+'”';
      if(st.matches&&!(new RegExp(st.matches,'i')).test(t))return '„'+sel+'”: tekst „'+t+'” nie pasuje do oczekiwanego formatu';
      return null}
    if(st.expectValue){if(norm(el.value)!==norm(st.equals))return '„'+sel+'”: wartość „'+el.value+'”, oczekiwano „'+st.equals+'”';return null}
    if(st.expectAttr){var a=el.getAttribute(st.attr);if(st.equals!==undefined?a!==String(st.equals):a===null)return '„'+sel+'”: atrybut '+st.attr+(st.equals!==undefined?' powinien mieć wartość „'+st.equals+'”, ma „'+a+'”':' jest wymagany');return null}
    if(st.expectStyle){var v=getComputedStyle(el)[st.prop];var ok=st.equals!==undefined?norm(v)===norm(st.equals):(st.oneOf||[]).map(norm).indexOf(norm(v))>-1;return ok?null:'„'+sel+'”: styl '+st.prop+' = „'+v+'”, oczekiwano „'+(st.equals||(st.oneOf||[]).join(' / '))+'”'}
    return 'Nieznany krok testu';
  }
  async function run(){
    var results=[];
    for(var i=0;i<CHECKS.length;i++){var c=CHECKS[i];var err=null;
      try{for(var j=0;j<c.steps.length;j++){err=await runStep(c.steps[j]);if(err)break}}catch(e){err='Błąd: '+e.message}
      results.push({name:c.name,pass:!err,error:err})}
    parent.postMessage({type:'inf04-checks',token:T,results:results},'*');
  }
  if(document.readyState==='complete')setTimeout(run,50);else window.addEventListener('load',function(){setTimeout(run,50)});
})();<\/script>`;
}

/** Składa pełny dokument HTML z części użytkownika. */
export function buildDocument({ html = '', css = '', js = '' }, { token, checks } = {}) {
  const t = token || 'preview';
  const isFull = /<html[\s>]/i.test(html);
  const safeJs = js.replace(/<\/script/gi, '<\\/script');
  const userScript = js.trim() ? `<script>\n${safeJs}\n<\/script>` : '';
  const style = css.trim() ? `<style>\n${css}\n</style>` : '';
  const pre = preludeScript(t);
  const post = checks ? checkerScript(t, checks) : '';

  if (isFull) {
    let doc = html;
    doc = /<\/head>/i.test(doc) ? doc.replace(/<\/head>/i, `${pre}${style}</head>`) : pre + style + doc;
    doc = /<\/body>/i.test(doc) ? doc.replace(/<\/body>(?![\s\S]*<\/body>)/i, `${userScript}${post}</body>`) : doc + userScript + post;
    return doc;
  }
  return `<!DOCTYPE html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${pre}<style>body{font-family:system-ui,sans-serif;margin:16px;line-height:1.5}</style>${style}</head><body>\n${html}\n${userScript}${post}</body></html>`;
}

/**
 * Uruchamia testy DOM w ukrytym iframe.
 * @returns {Promise<{results: {name, pass, error}[], logs: string[]}>}
 */
export function runDomChecks(parts, checks, timeoutMs = 5000) {
  return new Promise((resolve) => {
    const token = Math.random().toString(36).slice(2);
    const iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox', 'allow-scripts');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.cssText = 'position:absolute;width:1024px;height:768px;left:-10000px;top:0;border:0;visibility:hidden';
    const logs = [];

    const onMsg = (e) => {
      if (e.source !== iframe.contentWindow || !e.data || e.data.token !== token) return;
      if (e.data.type === 'inf04-log') logs.push((e.data.kind === 'error' ? '✖ ' : '') + e.data.text);
      if (e.data.type === 'inf04-checks') finish(e.data.results);
    };
    const timer = setTimeout(() => finish(checks.map((c) => ({ name: c.name, pass: false, error: 'Przekroczono limit czasu – strona się zawiesiła?' }))), timeoutMs);

    function finish(results) {
      clearTimeout(timer);
      window.removeEventListener('message', onMsg);
      iframe.remove();
      resolve({ results, logs });
    }

    window.addEventListener('message', onMsg);
    iframe.srcdoc = buildDocument(parts, { token, checks });
    document.body.append(iframe);
  });
}
