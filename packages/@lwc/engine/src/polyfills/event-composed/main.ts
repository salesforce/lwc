import detect from './detect';
import apply from './polyfill';

if (detect()) {
    apply();
}
