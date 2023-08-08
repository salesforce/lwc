import { createElement } from 'lwc';
import { getHooks, setHooks } from 'test-utils';

import XInnerHtml from 'x/innerHtml';

let originalSanitizeHtmlContent;

beforeAll(() => {
    originalSanitizeHtmlContent = getHooks().sanitizeHtmlContent;
    setHooks({
        sanitizeHtmlContent: (content) => content,
    });
});

afterAll(() => {
    setHooks({
        sanitizeHtmlContent: originalSanitizeHtmlContent,
    });
});

it('renders the content as HTML', () => {
    const elm = createElement('x-inner-html', { is: XInnerHtml });
    elm.content = 'Hello <b>World</b>';
    document.body.appendChild(elm);

    const div = elm.shadowRoot.querySelector('div');
    expect(div.childNodes.length).toBe(2);
    expect(div.childNodes[0].nodeType).toBe(Node.TEXT_NODE);
    expect(div.childNodes[0].textContent).toBe('Hello ');
    expect(div.childNodes[1].nodeType).toBe(Node.ELEMENT_NODE);
    expect(div.childNodes[1].tagName).toBe('B');
    expect(div.childNodes[1].textContent).toBe('World');
});

it('re-renders the content on update', () => {
    const elm = createElement('x-inner-html', { is: XInnerHtml });
    elm.content = 'Hello <b>World</b>';
    document.body.appendChild(elm);

    const b = elm.shadowRoot.querySelector('b');
    expect(b.textContent).toBe('World');

    elm.content = 'Hello <b>LWC</b>';
    return Promise.resolve().then(() => {
        const b = elm.shadowRoot.querySelector('b');
        expect(b.textContent).toBe('LWC');
    });
});

describe('type conversion', () => {
    const cases = [
        [null, ''],
        [undefined, 'undefined'],
        ['string', 'string'],
        [true, 'true'],
        [42, '42'],
    ];

    cases.forEach(([actual, expected]) => {
        it(`renders properly when passing type ${typeof actual}`, () => {
            const elm = createElement('x-inner-html', { is: XInnerHtml });
            elm.content = actual;
            document.body.appendChild(elm);

            const div = elm.shadowRoot.querySelector('div');
            expect(div.innerHTML).toBe(expected);
        });
    });
});

it('applies styles to injected content', (done) => {
    const elm = createElement('x-inner-html', { is: XInnerHtml });
    elm.content = '<b>Test</b>';
    document.body.appendChild(elm);

    // When running with synthetic shadow a micro task is needed to for the MutationObserver to add
    // the styling tokens. For IE11 specifically, we need to wait for a full task.
    setTimeout(() => {
        const b = elm.shadowRoot.querySelector('b');
        const styles = window.getComputedStyle(b);
        expect(styles.borderBottomStyle).toContain('dashed');

        done();
    });
});
