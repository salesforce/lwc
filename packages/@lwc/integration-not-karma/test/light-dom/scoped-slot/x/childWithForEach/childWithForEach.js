import { LightningElement } from 'lwc';

export default class extends LightningElement {
    static renderMode = 'light';
    items = [
        { id: 39, name: 'Audio' },
        { id: 40, name: 'Video' },
    ];
}
