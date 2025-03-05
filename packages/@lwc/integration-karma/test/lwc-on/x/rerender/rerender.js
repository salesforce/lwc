import { LightningElement, api } from 'lwc';

let testClick;
let testModifiedClick;
let testMouseover;

const clickHandler = function () {
    testClick('click handler called');
};

const modifiedClickHandler = function () {
    testModifiedClick('modified click handler called');
};

const mouseoverHandler = function () {
    testMouseover('mouseover handler called');
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
    get testClick() {
        return testClick;
    }
    set testClick(val) {
        testClick = val;
    }

    @api
    get testModifiedClick() {
        return testModifiedClick;
    }
    set testModifiedClick(val) {
        testModifiedClick = val;
    }

    @api
    get testMouseover() {
        return testMouseover;
    }
    set testMouseover(val) {
        testMouseover = val;
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
