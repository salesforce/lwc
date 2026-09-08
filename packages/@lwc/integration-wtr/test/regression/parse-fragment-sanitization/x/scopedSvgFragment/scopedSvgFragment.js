import { LightningElement } from 'lwc';
import styles from './scopedSvgFragment.scoped.css';

// A static SVG *child* under a non-static parent (the for:each) compiles to a `parseSVGFragment`
// call, which wraps the authored markup in `<svg>...</svg>` before it reaches `createFragment`.
// Combined with the `*.scoped.css` stylesheet, this proves that (a) the engine scope token survives
// a lossy hook on the SVG-namespace path, and (b) withholding the token does not corrupt legitimate
// author SVG attributes like `viewBox` (W-23814957).
export default class ScopedSvgFragment extends LightningElement {
    static stylesheets = [styles];

    items = [{ key: 'a' }];
}
