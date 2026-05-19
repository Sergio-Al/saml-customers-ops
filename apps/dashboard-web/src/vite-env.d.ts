/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_MOCK_EVENTS: string;
  readonly VITE_API_URL: string;
  readonly VITE_AUTH_URL: string;
  readonly VITE_TENANT_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
