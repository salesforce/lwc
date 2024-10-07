/**
 * Imports from `lwc` that are allowed in the SSR runtime context.
 * Every listed item should be a top-level export from `@lwc/ssr-runtime`.
 */
export const allowedLwcImports = new Set(['LightningElement']);
