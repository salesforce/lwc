import { createElement } from 'lwc';
import { getHooks, setHooks } from 'test-utils';

import XInnerHtml from 'x/innerHtml';

const ACTUAL_CONTENT = 'Hello <b>World</b>';
const ALTERNATIVE_CONTENT = 'Hello <b>LWC</b>';

const override = (content) => content;

it('throws when not overridden', () => {
    expect(() => {
        const elm = createElement('x-inner-html', { is: XInnerHtml });
        elm.content = ACTUAL_CONTENT;
        document.body.appendChild(elm);
    }).toThrowCallbackReactionError(Error, /sanitizeHtmlContent hook must be implemented/);
});

function setSanitizeHtmlContentHookForTest(impl) {
    const { sanitizeHtmlContent } = getHooks();

    setHooks({
        sanitizeHtmlContent: impl,
    });

    return sanitizeHtmlContent;
}

it('receives the right parameters', () => {
    const spy = jasmine.createSpy('sanitizeHook', override);
    const original = setSanitizeHtmlContentHookForTest(spy);

    const elm = createElement('x-inner-html', { is: XInnerHtml });
    elm.content = ACTUAL_CONTENT;
    document.body.appendChild(elm);

    expect(spy).toHaveBeenCalledWith(ACTUAL_CONTENT);
    setSanitizeHtmlContentHookForTest(original);
});

it('does not call sanitizeHtmlContent when raw value does not change', () => {
    const spy = jasmine.createSpy('sanitizeHook', override);
    const original = setSanitizeHtmlContentHookForTest(spy);

    const elm = createElement('x-inner-html', { is: XInnerHtml });
    elm.message = 'initial';
    elm.content = ACTUAL_CONTENT;
    document.body.appendChild(elm);
    expect(spy).toHaveBeenCalledTimes(1);

    elm.message = 'modified';

    return Promise.resolve().then(() => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(elm.shadowRoot.querySelector('p').innerText).toBe('modified');
        setSanitizeHtmlContentHookForTest(original);
    });
});

it('replace the original attribute value with the returned value', () => {
    const original = setSanitizeHtmlContentHookForTest(() => ALTERNATIVE_CONTENT);

    const elm = createElement('x-inner-html', { is: XInnerHtml });
    elm.content = ACTUAL_CONTENT;
    document.body.appendChild(elm);

    const div = elm.shadowRoot.querySelector('div');
    expect(div.innerHTML).toBe(ALTERNATIVE_CONTENT);

    setSanitizeHtmlContentHookForTest(original);
});
