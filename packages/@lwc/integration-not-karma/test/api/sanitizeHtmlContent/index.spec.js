import { createElement } from 'lwc';
import XInnerHtml from 'c/innerHtml';
import { fn as mockFn } from '@vitest/spy';
import { getHooks, setHooks } from '../../../helpers/hooks.js';

const ACTUAL_CONTENT = 'Hello <b>World</b>';
const ALTERNATIVE_CONTENT = 'Hello <b>LWC</b>';

function setSanitizeHtmlContentHook(sanitizeHtmlContent) {
    setHooks({ sanitizeHtmlContent });
}

let original;

beforeAll(() => {
    original = getHooks().sanitizeHtmlContent;
});
afterEach(() => setSanitizeHtmlContentHook(original));

it('throws when not overridden', () => {
    expect(() => {
        const elm = createElement('c-inner-html', { is: XInnerHtml });
        elm.content = ACTUAL_CONTENT;
        document.body.appendChild(elm);
    }).toThrowCallbackReactionError(Error, /sanitizeHtmlContent hook must be implemented/);
});

it('receives the right parameters', () => {
    const spy = mockFn();
    setSanitizeHtmlContentHook(spy);

    const elm = createElement('c-inner-html', { is: XInnerHtml });
    elm.content = ACTUAL_CONTENT;
    document.body.appendChild(elm);

    expect(spy).toHaveBeenCalledWith(ACTUAL_CONTENT);
});

it('does not call sanitizeHtmlContent when raw value does not change', async () => {
    const spy = mockFn();
    setSanitizeHtmlContentHook(spy);

    const elm = createElement('c-inner-html', { is: XInnerHtml });
    elm.message = 'initial';
    elm.content = ACTUAL_CONTENT;
    document.body.appendChild(elm);
    expect(spy).toHaveBeenCalledTimes(1);

    elm.message = 'modified';

    await Promise.resolve();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(elm.shadowRoot.querySelector('p').innerText).toBe('modified');
});

it('replace the original attribute value with the returned value', () => {
    setSanitizeHtmlContentHook(() => ALTERNATIVE_CONTENT);

    const elm = createElement('c-inner-html', { is: XInnerHtml });
    elm.content = ACTUAL_CONTENT;
    document.body.appendChild(elm);

    const div = elm.shadowRoot.querySelector('div');
    expect(div.innerHTML).toBe(ALTERNATIVE_CONTENT);
});
