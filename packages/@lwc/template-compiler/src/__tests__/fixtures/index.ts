import type { Config } from '../../';
export const files = import.meta.glob<string>('./**/actual.html', { query: '?raw', import: 'default', eager: true });
export const configs = import.meta.glob<Config>('./**/config.json', { import: 'default', eager: true });
export const dirname = import.meta.dirname;