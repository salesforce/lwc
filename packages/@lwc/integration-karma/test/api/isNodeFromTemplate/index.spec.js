import { createElement, isNodeFromTemplate } from 'lwc';
import Test from 'x/test';

function testNonNodes(type, obj) {
    it(`should return false if the passed object if a ${type}`, () => {
        expect(isNodeFromTemplate(obj)).toBe(false);
    });
}

testNonNodes('null', null);
testNonNodes('undefined', undefined);
testNonNodes('Object', {});

it('should return false for nodes not rendered in LWC', () => {
    const div = document.createElement('div');
    expect(isNodeFromTemplate(div)).toBe(false);
});

it('should return false on host element', () => {
    const elm = createElement('x-test', { is: Test });
    document.body.appendChild(elm);

    expect(isNodeFromTemplate(elm)).toBe(false);
});

it('should return false on the shadow root', () => {
    const elm = createElement('x-test', { is: Test });
    document.body.appendChild(elm);

    expect(isNodeFromTemplate(elm.shadowRoot)).toBe(false);
});

it('should return true on elements rendered from the template', () => {
    const elm = createElement('x-test', { is: Test });
    document.body.appendChild(elm);

    const div = elm.shadowRoot.querySelector('div');
    expect(isNodeFromTemplate(div)).toBe(true);
});

it('should return true on elements manually inserted in the DOM inside an element with lwc:dom="manual"', () => {
    const elm = createElement('x-test', { is: Test });
    document.body.appendChild(elm);

    const div = document.createElement('div');
    elm.shadowRoot.querySelector('div').appendChild(div);

    // TODO [#1253]: optimization to synchronously adopt new child nodes added
    // to this elm, we can do that by patching the most common operations
    // on the node itself
    if (!process.env.NATIVE_SHADOW) {
        expect(isNodeFromTemplate(div)).toBe(false); // it is false sync because MO hasn't pick up the element yet
    }
    return new Promise((resolve) => {
        setTimeout(resolve);
    }).then(() => {
        expect(isNodeFromTemplate(div)).toBe(true); // it is true async because MO has already pick up the element
    });
});

// TODO [#1252]: old behavior that is still used by some pieces of the platform
// if isNodeFromTemplate() returns true, locker will prevent traversing to such elements from document
if (!process.env.NATIVE_SHADOW) {
    it('should return false on elements manually inserted in the DOM inside an element NOT marked with lwc:dom="manual"', () => {
        const elm = createElement('x-test', { is: Test });
        document.body.appendChild(elm);
        spyOn(console, 'warn'); // ignore warning about manipulating node without lwc:dom="manual"

        const span = document.createElement('span');
        elm.shadowRoot.querySelector('h2').appendChild(span);

        return new Promise((resolve) => {
            setTimeout(resolve);
        }).then(() => {
            expect(isNodeFromTemplate(span)).toBe(false);
        });
    });
}
