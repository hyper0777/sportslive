/// <reference types="vite/client" />

interface ImportMetaEnv {
  // All sensitive API keys are managed in Netlify environment variables
  // Frontend has no direct access to API keys
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
