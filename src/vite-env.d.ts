/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Sensitive API keys are managed in Netlify environment variables
  // No frontend env vars needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
