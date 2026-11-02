import { createElement } from 'lwc';
import Parent from 'x/parent';

// This spec is run under BOTH synthetic and native shadow DOM via the
// integration-wtr infrastructure (see configs/integration.js — `SHADOW_MODE`
// env toggles between 'synthetic' default and 'native'). The assertions below
// hold identically in either mode:
//   - native: `elm.attachShadow({ mode: 'closed' })` is a first-class browser
//     API; `.shadowRoot` returns null from outside the component.
//   - synthetic: the polyfill stores `mode` in its internal record and
//     `shadowRootGetterPatched` only exposes the faux root when
//     `shadow.mode === 'open'` (see @lwc/synthetic-shadow/src/faux-shadow/
//     element.ts). Closed synthetic hosts also return null from `.shadowRoot`.

describe('static shadowRootMode', () => {
    it('renders a closed shadow root when child declares static shadowRootMode = "closed"', () => {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);

        const closed = elm.shadowRoot.querySelector('x-closed-child');
        // `.shadowRoot` is null for a closed host in both native and synthetic shadow.
        expect(closed.shadowRoot).toBe(null);
    });

    it('renders an open shadow root when child declares static shadowRootMode = "open"', () => {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);

        const open = elm.shadowRoot.querySelector('x-open-child');
        expect(open.shadowRoot).not.toBe(null);
        expect(open.shadowRoot.mode).toBe('open');
    });

    it('defaults to open when no static shadowRootMode is declared', () => {
        const elm = createElement('x-parent', { is: Parent });
        document.body.appendChild(elm);

        const def = elm.shadowRoot.querySelector('x-default-child');
        expect(def.shadowRoot).not.toBe(null);
        expect(def.shadowRoot.mode).toBe('open');
    });
});
