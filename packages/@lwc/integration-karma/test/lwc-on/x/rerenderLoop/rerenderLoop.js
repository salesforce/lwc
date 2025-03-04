import { LightningElement, api } from 'lwc';

/* eslint-disable no-console */
const clickHandler = function () {
    console.log('click handler called');
};

const modifiedClickHandler = function () {
    console.log('modified click handler called');
};

const mouseoverHandler = function () {
    console.log('mouseover handler called');
};
/* eslint-enable no-console */

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

export default class RerenderLoop extends LightningElement {
    dummy = 'dummy initial';
    @api listenersName;

    loopArray = [
        {
            key: 0,
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
            },
        },
    ];

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
