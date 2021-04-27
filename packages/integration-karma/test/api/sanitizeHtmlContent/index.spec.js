import { createElement } from 'lwc';

import XInnerHtml from 'x/innerHtml';

const ACTUAL_CONTENT = 'Hello <b>World</b>';
const ALTERNATIVE_CONTENT = 'Hello <b>LWC</b>';

const originalSanitizeHtmlContent = LWC.sanitizeHtmlContent;
afterEach(() => {
    // Reset original sanitizer after each test.
    LWC.sanitizeHtmlContent = originalSanitizeHtmlContent;
});

it('uses the original passthrough sanitizer when not overridden', () => {
    const elm = createElement('x-inner-html', { is: XInnerHtml });
    elm.content = ACTUAL_CONTENT;
    document.body.appendChild(elm);

    const div = elm.shadowRoot.querySelector('div');
    expect(div.innerHTML).toBe(ACTUAL_CONTENT);
});

it('receives the right parameters', () => {
    spyOn(LWC, 'sanitizeHtmlContent');

    const elm = createElement('x-inner-html', { is: XInnerHtml });
    elm.content = ACTUAL_CONTENT;
    document.body.appendChild(elm);

    expect(LWC.sanitizeHtmlContent).toHaveBeenCalledWith(ACTUAL_CONTENT);
});

it('replace the original attribute value with the returned value', () => {
    LWC.sanitizeHtmlContent = () => ALTERNATIVE_CONTENT;

    const elm = createElement('x-inner-html', { is: XInnerHtml });
    elm.content = ACTUAL_CONTENT;
    document.body.appendChild(elm);

    const div = elm.shadowRoot.querySelector('div');
    expect(div.innerHTML).toBe(ALTERNATIVE_CONTENT);
});
