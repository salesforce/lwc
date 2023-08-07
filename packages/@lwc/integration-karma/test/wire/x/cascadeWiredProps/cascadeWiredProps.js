import { LightningElement, wire } from 'lwc';
import { EchoWireAdapter } from 'x/echoWireAdapter';

export default class CascadeWiredProps extends LightningElement {
    firstParamValue = 'first-param-value';
    secondParamValue = 'second-param-value';

    @wire(EchoWireAdapter, { firstParam: '$firstParamValue', secondParam: '$secondParamValue' })
    firstWire;

    @wire(EchoWireAdapter, {
        firstParam: '$firstWire.firstParam',
        secondParam: '$firstWire.secondParam',
    })
    setSecondWire(providedValue) {
        this.dispatchEvent(
            new CustomEvent('dependantwirevalue', {
                detail: { providedValue },
            })
        );
    }
}
