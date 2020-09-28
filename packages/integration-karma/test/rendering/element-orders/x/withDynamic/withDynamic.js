import { LightningElement, api } from 'lwc';

export default class WithDynamic extends LightningElement {
    show = false;
    showFourth = false;

    @api
    triggerDiffingAlgo() {
        this.show = true;
    }
}
