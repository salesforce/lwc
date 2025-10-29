import { createElement } from 'lwc';
import Test from 'c/test';
import { spyOn } from '@vitest/spy';
import { getHooks, setHooks } from '../../helpers/hooks.js';

function setSanitizeHtmlContentHookForTest(impl) {
    const { sanitizeHtmlContent } = getHooks();

    setHooks({
        sanitizeHtmlContent: impl,
    });

    return sanitizeHtmlContent;
}
describe('lwc:spread', () => {
    let elm,
        simpleChild,
        overriddenChild,
        trackedChild,
        innerHTMLChild,
        originalHook,
        warnSpy,
        logSpy;
    beforeAll(() => {
        warnSpy = spyOn(console, 'warn');
        logSpy = spyOn(console, 'log');
    });
    beforeEach(() => {
        originalHook = setSanitizeHtmlContentHookForTest((x) => x);
        elm = createElement('c-test', { is: Test });
        document.body.appendChild(elm);
        simpleChild = elm.shadowRoot.querySelector('.c-child-simple');
        overriddenChild = elm.shadowRoot.querySelector('.c-child-overridden');
        trackedChild = elm.shadowRoot.querySelector('.c-child-tracked');
        innerHTMLChild = elm.shadowRoot.querySelector('.div-innerhtml');
    });
    afterEach(() => {
        setSanitizeHtmlContentHookForTest(originalHook);
        logSpy.mockReset();
        warnSpy.mockReset();
    });
    afterAll(() => {
        logSpy.mockRestore();
        warnSpy.mockRestore();
    });
    it('should render basic test', () => {
        expect(simpleChild.shadowRoot.querySelector('span').textContent).toEqual('Name: LWC');
    });
    it('should not override innerHTML from inner-html directive', () => {
        expect(innerHTMLChild.innerHTML).toEqual('');

        if (process.env.NODE_ENV === 'production') {
            expect(warnSpy).not.toHaveBeenCalled();
        } else {
            expect(warnSpy).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({
                    message: expect.stringContaining(
                        `Cannot set property "innerHTML". Instead, use lwc:inner-html or lwc:dom-manual.`
                    ),
                })
            );
        }
    });
    it('should assign onclick', () => {
        simpleChild.click();
        expect(logSpy).toHaveBeenCalledWith('spread click called', simpleChild);
    });
    it('should override values in template', async () => {
        expect(overriddenChild.shadowRoot.querySelector('span').textContent).toEqual('Name: Aura');
        elm.modify(function () {
            this.overriddenProps = {};
        });
        await Promise.resolve();
        expect(overriddenChild.shadowRoot.querySelector('span').textContent).toEqual('Name: lwc');
    });
    it('should assign onclick along with the one in template', () => {
        overriddenChild.click();
        expect(logSpy).toHaveBeenCalledWith('spread click called', overriddenChild);
        expect(logSpy).toHaveBeenCalledWith(
            'template click called',
            expect.any(Object) /* component */
        );
    });

    it('should assign props to standard elements', async () => {
        expect(elm.shadowRoot.querySelector('span').className).toEqual('spanclass');

        elm.modify(function () {
            this.spanProps = { className: 'spanclass2' };
        });
        await Promise.resolve();
        expect(elm.shadowRoot.querySelector('span').className).toEqual('spanclass2');

        elm.modify(function () {
            this.spanProps = {};
        });
        await Promise.resolve();
        expect(elm.shadowRoot.querySelector('span').className).toEqual('spanclass2');

        elm.modify(function () {
            this.spanProps = { className: undefined };
        });
        await Promise.resolve();
        expect(elm.shadowRoot.querySelector('span').className).toEqual('undefined');

        elm.modify(function () {
            this.spanProps = { className: '' };
        });
        await Promise.resolve();
        expect(elm.shadowRoot.querySelector('span').className).toEqual('');
    });
    it('should assign props to dynamic elements using lwc:dynamic', () => {
        expect(
            elm.shadowRoot.querySelector('c-cmp').shadowRoot.querySelector('span').textContent
        ).toEqual('Name: Dynamic');
    });
    it('should assign props to dynamic elements', () => {
        expect(
            elm.shadowRoot
                .querySelector('[data-id="lwc-component"]')
                .shadowRoot.querySelector('span').textContent
        ).toEqual('Name: Dynamic');
    });

    it('should rerender when tracked props are assigned', async () => {
        expect(trackedChild.shadowRoot.querySelector('span').textContent).toEqual('Name: Tracked');
        elm.modify(function () {
            this.trackedProps.name = 'Altered';
        });
        await Promise.resolve();
        expect(trackedChild.shadowRoot.querySelector('span').textContent).toEqual('Name: Altered');
    });
});
