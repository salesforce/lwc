import { LightningElement, api } from 'lwc';

export default class Main extends LightningElement {
    dynamic = 'I am dynamic';
    _executedHandlerCounter = 0;

    @api
    get timesHandlerIsExecuted() {
        return this._executedHandlerCounter;
    }

    handleClick() {
        this._executedHandlerCounter++;
    }
}
