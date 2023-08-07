import { createElement } from 'lwc';
import Component from 'x/component';

describe('unknown properties', () => {
    it('warns when setting unknown properties', () => {
        const elm = createElement('x-component', { is: Component });
        expect(() => {
            document.body.appendChild(elm);
        }).toLogWarningDev(
            'Error: [LWC warn]: Unknown public property "propertyThatDefinitelyDoesNotExist" of element <x-child>. ' +
                'This is either a typo on the corresponding attribute "property-that-definitely-does-not-exist", or ' +
                'the attribute does not exist in this browser or DOM implementation.'
        );
    });
});
