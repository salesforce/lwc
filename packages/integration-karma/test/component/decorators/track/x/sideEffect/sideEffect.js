import { LightningElement, track } from 'lwc';
import tmpl from './sideEffect.html';

export default class SideEffect extends LightningElement {
    @track prop = 0;

    render() {
        this.prop += 1;
        return tmpl;
    }
}
