import { LightningElement, api } from 'lwc';

export default class Main extends LightningElement {
    _executedHandlerCounter = 0;

    @api
    get timesHandlerIsExecuted() {
        return this._executedHandlerCounter;
    }

    handleClick() {
        this._executedHandlerCounter++;
    }
}
