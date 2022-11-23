import features from '@lwc/features';
import { applyAriaReflection } from '@lwc/aria-reflection';

if (!features.DISABLE_ARIA_REFLECTION_POLYFILL) {
    applyAriaReflection();
}
