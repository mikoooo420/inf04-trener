// =========================================================
// LOADER – pobieranie danych (JSON/Markdown) i leniwe ładowanie skryptów
// =========================================================

const cache = new Map();
const scripts = new Map();

/** Ścieżki są względne do index.html – działa w podkatalogu GitHub Pages. */
function resolve(path) {
  return new URL(path, document.baseURI).href;
}

async function fetchChecked(path) {
  const res = await fetch(resolve(path), { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Nie udało się pobrać ${path} (HTTP ${res.status})`);
  return res;
}

export function fetchJSON(path) {
  if (!cache.has(path)) {
    const p = fetchChecked(path).then((r) => r.json());
    p.catch(() => cache.delete(path));
    cache.set(path, p);
  }
  return cache.get(path);
}

export function fetchText(path) {
  const key = `text:${path}`;
  if (!cache.has(key)) {
    const p = fetchChecked(path).then((r) => r.text());
    p.catch(() => cache.delete(key));
    cache.set(key, p);
  }
  return cache.get(key);
}

/** Wczytuje klasyczny skrypt (UMD) tylko raz; zwraca Promise. */
export function loadScript(src) {
  if (!scripts.has(src)) {
    const p = new Promise((resolveP, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => resolveP();
      s.onerror = () => {
        scripts.delete(src);
        s.remove();
        reject(new Error(`Nie udało się wczytać biblioteki: ${src}`));
      };
      document.head.append(s);
    });
    scripts.set(src, p);
  }
  return scripts.get(src);
}

// ---------- Dane aplikacji ----------

/** Manifest treści – lista działów, tematów i metadanych. */
export const getManifest = () => fetchJSON('./data/manifest.json');

/** Wszystkie pytania ze wszystkich działów (spłaszczone). */
export async function getAllQuestions() {
  const manifest = await getManifest();
  const lists = await Promise.all(
    manifest.topics.map((t) =>
      fetchJSON(`./data/questions/${t.id}.json`)
        .then((qs) => qs.map((q) => ({ ...q, topic: q.topic || t.id })))
        .catch(() => [])
    )
  );
  return lists.flat();
}

export async function getQuestionsByTopic(topicId) {
  try {
    const qs = await fetchJSON(`./data/questions/${topicId}.json`);
    return qs.map((q) => ({ ...q, topic: q.topic || topicId }));
  } catch {
    return [];
  }
}

export const getSqlTasks = () => fetchJSON('./data/sql/tasks.json');
export const getCodeTasks = () => fetchJSON('./data/code/tasks.json');
export const getProjects = () => fetchJSON('./data/projects/projects.json');
export const getGui = () => fetchJSON('./data/gui/tasks.json');
