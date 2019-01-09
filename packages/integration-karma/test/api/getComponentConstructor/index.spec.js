// TODO: disable lwc import check for testing purposes. For now use a workaround to directly access the API from the
// engine inject globally as UMD.
const { getComponentConstructor } = window.Engine;

import { LightningElement } from 'lwc';
import { createElement } from 'test-utils';

function testInvalidComponentInstance(name, obj) {
    it('should return null for non-component instance', () => {
        expect(getComponentConstructor(obj)).toBe(null);
    });
}

testInvalidComponentInstance('null', null);
testInvalidComponentInstance('undefined', undefined);
testInvalidComponentInstance('object', {});
testInvalidComponentInstance('HTMLElement', document.createElement('div'));

it('should return the component constructor for the created element', () => {
    class Component extends LightningElement {}
    const elm = createElement('x-component', { is: Component });

    expect(getComponentConstructor(elm)).toBe(Component);
});
