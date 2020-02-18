import { LightningElement, api, track, wire } from 'lwc';
import { getTodo, echoAdapter } from 'todo';

export default class WiredProp extends LightningElement {
    @api todoId;

    @wire(getTodo, { id: '$todoId' })
    todo;

    get error() {
        return 'Error loading data: ' + this.todo.error.message;
    }

    firstParamValue = 'first-param-value';
    secondParamValue = 'second-param-value';

    @wire(echoAdapter, { firstParam: '$firstParamValue', secondParam: '$secondParamValue' })
    firstWire;

    @wire(echoAdapter, {
        firstParam: '$firstWire.firstParam',
        secondParam: '$firstWire.secondParam',
    })
    setSecondWire(newValue) {
        debugger;
        console.log(newValue);
    };
}
