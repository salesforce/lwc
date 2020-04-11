import { LightningElement, wire, api } from 'lwc';
import { EchoWireAdapter } from 'x/echoWireAdapter';

export default class SimpleWiredProps extends LightningElement {
    configValue = null;
    firstParamValue;
    secondParamValue;

    @wire(EchoWireAdapter, {
        firstParam: '$firstParamValue',
        secondWire: '$secondParamValue',
    })
    simpleWire(providedValue) {
        this.configValue = providedValue;
        this.dispatchEvent(
            new CustomEvent('adapterupdate', {
                detail: { providedValue },
            })
        );
    }

    @api
    setSimpleWireConfig(value) {
        this.firstParamValue = value;
    }
}
