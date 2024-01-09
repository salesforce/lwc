import { accept, register } from '@lwc/hmr-client';
import type { HMR_Accept, HMR_Register } from '@lwc/hmr-client';
export let hot: undefined | { accept: HMR_Accept; register: HMR_Register };

if (process.env.NODE_ENV !== 'production') {
    hot = { accept, register };
}
