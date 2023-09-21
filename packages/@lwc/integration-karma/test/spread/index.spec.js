import { createElement } from 'lwc';
import Test from 'x/test';
import { getHooks, setHooks } from 'test-utils';

function setSanitizeHtmlContentHookForTest(impl) {
    const { sanitizeHtmlContent } = getHooks();

    setHooks({
        sanitizeHtmlContent: impl,
    });

    return sanitizeHtmlContent;
}
describe('lwc:spread', () => {
    let elm, simpleChild, overriddenChild, trackedChild, innerHTMLChild, originalHook;
    beforeEach(() => {
        originalHook = setSanitizeHtmlContentHookForTest((x) => x);
        elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);
        simpleChild = elm.shadowRoot.querySelector('.x-child-simple');
        overriddenChild = elm.shadowRoot.querySelector('.x-child-overridden');
        trackedChild = elm.shadowRoot.querySelector('.x-child-tracked');
        innerHTMLChild = elm.shadowRoot.querySelector('.div-innerhtml');
        spyOn(console, 'log');
    });
    afterEach(() => {
        setSanitizeHtmlContentHookForTest(originalHook);
    });
    it('should render basic test', () => {
        expect(simpleChild.shadowRoot.querySelector('span').textContent).toEqual('Name: LWC');
    });
    it('should override innerHTML from inner-html directive', () => {
        expect(innerHTMLChild.innerHTML).toEqual('innerHTML from spread');
    });
    it('should assign onclick', () => {
        simpleChild.click();
        // eslint-disable-next-line no-console
        expect(console.log).toHaveBeenCalledWith('spread click called', simpleChild);
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
        // eslint-disable-next-line no-console
        expect(console.log).toHaveBeenCalledWith('spread click called', overriddenChild);
        // eslint-disable-next-line no-console
        expect(console.log).toHaveBeenCalledWith(
            'template click called',
            jasmine.any(Object) /* component */
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
            elm.shadowRoot.querySelector('x-cmp').shadowRoot.querySelector('span').textContent
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
