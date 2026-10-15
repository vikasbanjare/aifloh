interface ImportMetaEnv {
  readonly SITE_URL?: string;
  readonly BASE_PATH?: string;
  readonly DEPLOY_TARGET?: 'github-pages' | 'cloudflare';
  readonly ANALYTICS_TOOL?: 'plausible' | 'umami' | 'none';
  readonly ANALYTICS_SRC?: string;
  readonly ANALYTICS_DOMAIN?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
