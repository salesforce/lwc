import features from '@lwc/features';
import { applyAriaReflection } from '@lwc/aria-reflection-polyfill';

if (!features.DISABLE_ARIA_REFLECTION_POLYFILL) {
    applyAriaReflection();
}
