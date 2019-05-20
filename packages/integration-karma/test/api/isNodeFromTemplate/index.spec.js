// TODO: Open issue for this
const { isNodeFromTemplate } = Engine;

import { createElement } from 'lwc';
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

    return new Promise(resolve => {
        setTimeout(resolve);
    }).then(() => {
        expect(isNodeFromTemplate(div)).toBe(true);
    });
});

// TODO: cpatino: RRH relies on this behavior
// if isNodeFromTemplate() returns true, locker will prevent traversing to such elements from document
xit('should return false on elements manually inserted in the DOM inside an element NOT marked with lwc:dom="manual"', () => {
    const elm = createElement('x-test', { is: Test });
    document.body.appendChild(elm);
    spyOn(console, 'error'); // ignore warning about manipulating node without lwc:dom="manual"

    const span = document.createElement('span');
    elm.shadowRoot.querySelector('h2').appendChild(span);

    return new Promise(resolve => {
        setTimeout(resolve);
    }).then(() => {
        expect(isNodeFromTemplate(span)).toBe(false);
    });
});
