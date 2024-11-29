import { LightningElement } from 'lwc';

export default class Test extends LightningElement {
    static renderMode = 'light';

    data = {
        id: 'a',
        name: 'b',
    };
}
