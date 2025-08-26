import { LightningElement, api } from 'lwc';

export default class Main extends LightningElement {
    _clickedHandlerCounter = 0;
    _fooHandlerCounter = 0;

    @api
    get timesClickedHandlerIsExecuted() {
        return this._clickedHandlerCounter;
    }

    @api
    get timesFooHandlerIsExecuted() {
        return this._fooHandlerCounter;
    }

    eventListeners = {
        click: function () {
            this._clickedHandlerCounter++;
        },
        foo: function () {
            this._fooHandlerCounter++;
        },
    };
}
