import { LightningElement, api } from 'lwc';

let testClick;
let testMouseover;
export default class Basic extends LightningElement {
    @api
    get testClick() {
        return testClick;
    }
    set testClick(val) {
        testClick = val;
    }

    @api
    get testMouseover() {
        return testMouseover;
    }
    set testMouseover(val) {
        testMouseover = val;
    }

    eventHandlers = {
        click: function () {
            testClick('click handler called');
        },
        mouseover: function () {
            testMouseover('mouseover handler called');
        },
    };
}
