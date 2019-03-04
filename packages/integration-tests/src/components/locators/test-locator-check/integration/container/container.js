import { LightningElement } from 'lwc';

export default class Container extends LightningElement {
    containerContext() {
        return {
            'key-parent': Container.state1,
            'key-common': Container.state2,
        };
    }

    containerSlotContext() {
        return {
            'key-slot': Container.state3,
        };
    }

    containerClick() {
        window.clicked = true;
    }
}

Container.state1 = 'from-container-1';
Container.state2 = 'from-container-2';
Container.state3 = 'from-container-3';
