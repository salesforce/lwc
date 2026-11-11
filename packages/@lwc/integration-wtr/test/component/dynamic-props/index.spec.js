import { createElement } from 'lwc';
import Parent from 'x/parent';

describe('static dynamicProps', () => {
    it('suppresses "Unknown public property" warning for components with static dynamicProps = true', () => {
        const elm = createElement('x-parent', { is: Parent });
        elm.showShapeShifter = true;
        expect(() => {
            document.body.appendChild(elm);
        }).not.toLogWarningDev();
    });

    it('still warns for components that have not opted in', () => {
        const elm = createElement('x-parent', { is: Parent });
        elm.showPlainChild = true;
        expect(() => {
            document.body.appendChild(elm);
        }).toLogWarningDev(
            'Error: [LWC warn]: Unknown public property "undeclaredProp" of element <x-plain-child>. ' +
                'This is either a typo on the corresponding attribute "undeclared-prop", or ' +
                'the attribute does not exist in this browser or DOM implementation.'
        );
    });
});
