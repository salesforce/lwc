import { LightningElement, track } from 'lwc';

export default class SideEffect extends LightningElement {
    @track prop = 0;

    render() {
        this.prop += 1;
    }
}
