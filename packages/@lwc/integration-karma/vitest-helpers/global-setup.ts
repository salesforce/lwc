// globalThis.process = {
//     env: {
//         API_VERSION: 63,
//         DISABLE_STATIC_CONTENT_OPTIMIZATION: false,
//         ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL: false,
//         ENABLE_SYNTHETIC_SHADOW_IN_HYDRATION: false,
//         FORCE_NATIVE_SHADOW_MODE_FOR_TEST: false,
//         LWC_VERSION: "8.1.0",
//         NATIVE_SHADOW: false,
//         NODE_ENV: "development",
//     }
// };
// globalThis.lwcRuntimeFlags = {
//   DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE: false
// };
import type { GlobalSetupContext } from 'vitest/node';

export default function setup({ provide }: GlobalSetupContext) {
    provide('wsPort', 3000);
}

declare module 'vitest' {
    export interface ProvidedContext {
        wsPort: number;
    }
}
