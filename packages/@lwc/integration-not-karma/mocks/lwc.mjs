// IMPORTANT: we must use @lwc/engine-dom instead of lwc in order to avoid circular imports
import { sanitizeAttribute as _sanitizeAttribute } from '@lwc/engine-dom';
import { fn } from '@vitest/spy';

export * from '@lwc/engine-dom';
export const sanitizeAttribute = fn(_sanitizeAttribute);
