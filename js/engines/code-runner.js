// =========================================================
// CODE RUNNER – uruchamia kod w Web Workerze z limitem czasu
// =========================================================

import { CODE_TIMEOUT_MS } from '../config.js';

const WORKER_URL = new URL('./code-worker.js', import.meta.url);

/**
 * @param {object} job { code, fn, tests, runTopLevel }
 * @returns {Promise<{logs, topError, results, timeout?}>}
 */
export function runCode(job, timeoutMs = CODE_TIMEOUT_MS) {
  return new Promise((resolve) => {
    let worker;
    try {
      worker = new Worker(WORKER_URL);
    } catch (err) {
      resolve({ logs: [], topError: 'Przeglądarka nie pozwoliła uruchomić Web Workera: ' + err.message, results: [] });
      return;
    }
    const timer = setTimeout(() => {
      worker.terminate();
      resolve({
        logs: [],
        topError: `Przekroczono limit czasu (${timeoutMs / 1000} s). Sprawdź, czy nie masz nieskończonej pętli.`,
        results: (job.tests || []).map((t) => ({ name: t.name || 'Test', pass: false, error: 'Przekroczono limit czasu', hidden: t.hidden })),
        timeout: true,
      });
    }, timeoutMs);

    worker.onmessage = (e) => {
      clearTimeout(timer);
      worker.terminate();
      resolve(e.data);
    };
    worker.onerror = (e) => {
      clearTimeout(timer);
      worker.terminate();
      e.preventDefault?.();
      resolve({ logs: [], topError: 'Błąd składni: ' + (e.message || 'nie udało się wykonać kodu'), results: [] });
    };
    worker.postMessage(job);
  });
}
