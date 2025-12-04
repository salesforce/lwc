import { LightningElement } from 'lwc';

export default class Test extends LightningElement {
    static renderMode = 'light';

    item = {
        id: 'a',
        name: 'b',
    };
}
