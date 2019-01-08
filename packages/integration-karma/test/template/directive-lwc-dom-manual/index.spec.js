import { createElement } from 'lwc';
import XTest from 'x/test';

function testErrorOnDomMutation(method, fn) {
    it(`should log an error when calling ${method} on an element without the lwc:dom="manual" directive`, () => {
        const root = createElement('x-test', { is: XTest });
        document.body.appendChild(root);

        spyOn(console, 'error');

        const elm = root.shadowRoot.querySelector('.not-manual');
        fn(elm);

        const [msg] = console.error.calls.argsFor(0);
        expect(msg).toMatch(`\\[LWC error\\]: ${method} is disallowed in Element unless \`lwc:dom="manual"\` directive is used in the template.`)
    });
}

testErrorOnDomMutation('appendChild', (elm) => {
    const child = document.createElement('div');
    elm.appendChild(child);
});

testErrorOnDomMutation('insertBefore', (elm) => {
    const child = document.createElement('div');
    const span = elm.firstElementChild;
    elm.insertBefore(child, span);
});

testErrorOnDomMutation('removeChild', (elm) => {
    const span = elm.firstElementChild;
    elm.removeChild(span);
});

testErrorOnDomMutation('replaceChild', (elm) => {
    const child = document.createElement('div');
    const span = elm.firstElementChild;
    elm.replaceChild(child, span);
});

testErrorOnDomMutation('innerHTML', (elm) => {
    elm.innerHTML = `<div></div>`
});

function testAllowDomMutationWithLwcDomDirective(method, fn) {
    it(`should not log an error when calling ${method} on an element with the lwc:dom="manual" directive`, () => {
        const root = createElement('x-test', { is: XTest });
        document.body.appendChild(root);

        spyOn(console, 'error');

        const elm = root.shadowRoot.querySelector('.manual');
        fn(elm);

        expect(console.error).not.toHaveBeenCalled();
    });
}

testAllowDomMutationWithLwcDomDirective('appendChild', (elm) => {
    const child = document.createElement('div');
    elm.appendChild(child);
});

testAllowDomMutationWithLwcDomDirective('innerHTML', (elm) => {
    elm.innerHTML = `<div></div>`
});

it('should apply the styles to inserted elements', () => {
    const root = createElement('x-test', { is: XTest });
    document.body.appendChild(root);

    const elm = root.shadowRoot.querySelector('.manual');
    elm.innerHTML = '<div class="foo"><div>';

    return Promise.resolve().then(() => {
        expect(window.getComputedStyle(elm.firstElementChild).margin).toBe('10px');
    });
});
