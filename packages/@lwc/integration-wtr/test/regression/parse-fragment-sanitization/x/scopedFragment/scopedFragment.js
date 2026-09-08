import { LightningElement } from 'lwc';
import styles from './scopedFragment.scoped.css';

// A purely static template (no dynamic bindings) compiles to a `parseFragment` call, and the
// `*.scoped.css` stylesheet forces the engine to emit a scope token (a `lwc-<hash>` class, plus a
// bare `lwc-<hash>` attribute in synthetic shadow) onto every element of the static fragment. This
// is the fixture that proves those engine-generated scope tokens survive an externally-installed
// lossy `sanitizeHtmlContent` hook when `ENABLE_PARSE_FRAGMENT_SANITIZATION` is enabled (W-23814957).
export default class ScopedFragment extends LightningElement {
    static stylesheets = [styles];
}
