import { LightningElement, wire, api } from 'lwc';
import { EchoWireAdapter } from 'x/echoWireAdapter';

export default class SimpleWiredProps extends LightningElement {
    configValue = null;
    firstParamValue;

    @wire(EchoWireAdapter, {
        firstParam: '$firstParamValue',
    })
    simpleWire(providedValue) {
        this.configValue = providedValue;
        this.dispatchEvent(
            new CustomEvent('dependantwirevalue', {
                detail: { providedValue },
            })
        );
    }

    @api
    getSimpleWireConfig() {
        return this.configValue;
    }

    @api
    setSimpleWireConfig(value) {
        this.firstParamValue = value;
    }
}
