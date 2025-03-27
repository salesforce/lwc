import { LightningElement, api } from 'lwc';

let testFn;

const clickHandler = function () {
    testFn('click handler called');
};

const modifiedClickHandler = function () {
    testFn('modified click handler called');
};

const mouseoverHandler = function () {
    testFn('mouseover handler called');
};

const clickObject = {
    click: clickHandler,
};

const modifiedClickObject = {
    click: modifiedClickHandler,
};

const clickAndMouseoverObject = {
    click: clickHandler,
    mouseover: mouseoverHandler,
};

const emptyObject = {};

const defaultObject = clickObject;

export default class Rerender extends LightningElement {
    dummy = 'dummy initial';
    @api listenersName;

    @api
    get testFn() {
        return testFn;
    }
    set testFn(val) {
        testFn = val;
    }

    get eventHandlers() {
        switch (this.listenersName) {
            case 'modified click':
                return modifiedClickObject;
            case 'click and mouseover':
                return clickAndMouseoverObject;
            case 'empty':
                return emptyObject;
            default:
                return defaultObject;
        }
    }

    @api
    triggerReRender() {
        this.dummy = 'dummy changed';
    }

    @api
    addMouseoverHandler() {
        defaultObject['mouseover'] = mouseoverHandler;
    }

    @api
    modifyClickHandler() {
        defaultObject['click'] = modifiedClickHandler;
    }

    @api
    deleteClickHandler() {
        delete defaultObject['click'];
    }
}
