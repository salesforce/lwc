import { detect } from './detect';
import { patch } from './polyfill';

if (detect()) {
    patch();
}
