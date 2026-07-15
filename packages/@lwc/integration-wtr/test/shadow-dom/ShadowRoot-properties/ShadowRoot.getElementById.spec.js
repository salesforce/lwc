import { createElement } from 'lwc';

import GetById from 'x/getById';

// These run in both synthetic and native shadow to lock in parity with the native
// `DocumentFragment.prototype.getElementById` that `ShadowRoot` inherits.
//
// Note: LWC scopes static template `id` attributes by appending a unique suffix at
// runtime (e.g. `id="foo"` renders as `id="foo-0"`), so these tests derive the real
// rendered id from the DOM rather than hard-coding it — which mirrors how a real
// consumer (e.g. a monitoring agent) queries against the actual rendered ids.
describe('ShadowRoot.getElementById', () => {
    let elm;

    beforeEach(() => {
        elm = createElement('x-get-by-id', { is: GetById });
        document.body.appendChild(elm);
    });

    afterEach(() => {
        elm.remove();
    });

    it('returns the element with the matching id within the shadow tree', () => {
        const div = elm.shadowRoot.querySelector('div');
        const found = elm.shadowRoot.getElementById(div.id);
        expect(found).toBe(div);
        expect(found.textContent).toBe('foo');
    });

    it('returns null when no element has the id', () => {
        expect(elm.shadowRoot.getElementById('does-not-exist')).toBe(null);
    });

    it('returns null for an empty id', () => {
        expect(elm.shadowRoot.getElementById('')).toBe(null);
    });

    it('escapes the id rather than treating it as a selector', () => {
        // The rendered id contains a "." which, if passed through as a CSS selector,
        // would be parsed as a class combinator and fail to match.
        const span = elm.shadowRoot.querySelector('span');
        expect(span.id).toContain('.');
        const found = elm.shadowRoot.getElementById(span.id);
        expect(found).toBe(span);
        expect(found.textContent).toBe('special');
    });

    it('is scoped to its own shadow tree and does not cross into child shadow trees', () => {
        // The host and the nested child component both render a <div> with an id.
        const outerDiv = elm.shadowRoot.querySelector('div');
        const inner = elm.shadowRoot.querySelector('x-get-by-id-inner');
        const innerDiv = inner.shadowRoot.querySelector('div');

        // Looking up the inner id from the outer shadow root must not find it.
        expect(elm.shadowRoot.getElementById(innerDiv.id)).toBe(null);
        // ...and vice versa.
        expect(inner.shadowRoot.getElementById(outerDiv.id)).toBe(null);

        expect(elm.shadowRoot.getElementById(outerDiv.id)).toBe(outerDiv);
        expect(inner.shadowRoot.getElementById(innerDiv.id)).toBe(innerDiv);
    });
});
