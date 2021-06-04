import { LightningElement, api } from 'lwc';
import one from './one.html';
import two from './two.html';

export default class extends LightningElement {
    static preferNativeShadow = true;

    @api tryToRenderSynthetic = false;

    render() {
        return this.tryToRenderSynthetic ? two : one;
    }
}
