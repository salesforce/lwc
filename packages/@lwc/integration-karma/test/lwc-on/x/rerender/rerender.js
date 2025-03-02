import { LightningElement, api } from 'lwc';

/* eslint-disable no-console */
const clickObject = {
    click: function () {
        console.log('click handler called');
    },
};

const modifiedClickObject = {
    click: function () {
        console.log('modified click handler called');
    },
};

const clickAndMouseoverObject = {
    click: function () {
        console.log('click handler called');
    },
    mouseover: function () {
        console.log('mouseover handler called');
    },
};

const emptyObject = {};
/* eslint-enable no-console */

export default class Rerender extends LightningElement {
    dummy = 'dummy initial';
    @api listenersName;

    get eventHandlers() {
        switch (this.listenersName) {
            case 'modified click':
                return modifiedClickObject;
            case 'click and mouseover':
                return clickAndMouseoverObject;
            case 'empty':
                return emptyObject;
            default:
                return clickObject;
        }
    }

    @api
    triggerReRender() {
        this.dummy = 'dummy changed';
    }
}
