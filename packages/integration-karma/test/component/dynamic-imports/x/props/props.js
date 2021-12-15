import { api, LightningElement, track } from 'lwc';
import ConfigOne from 'x/configone';
import ConfigTwo from 'x/configtwo';

export default class Props extends LightningElement {
    @track config = undefined;

    @api enableOne() {
        this.config = { constructor: ConfigOne, props: { prop1: 'prop1 value' } };
    }

    @api enableTwo() {
        this.config = { constructor: ConfigTwo, props: { prop2: 'prop2 value' } };
    }

    @api disableAll() {
        this.config = null;
    }
}
