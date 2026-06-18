/**
 * Resolve Ollama host from env (supports OLLAMA_HOST and legacy OLLAMA_URL).
 */
export function getOllamaHost() {
  return (
    process.env.OLLAMA_HOST ||
    process.env.OLLAMA_URL ||
    "http://127.0.0.1:11434"
  );
}
