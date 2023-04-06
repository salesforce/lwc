import { LightningElement } from 'lwc';

export default class extends LightningElement {
    static stylesheets = [
        () => {
            return 'h1 { color: red; }';
        },
    ];
}
