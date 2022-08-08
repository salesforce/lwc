import { track, api, LightningElement } from 'lwc';
import ConfigOne from 'x/configone';
import ConfigTwo from 'x/configtwo';

export default class Props extends LightningElement {
    @track
    config = undefined;

    @api enableOne() {
        this.config = { ctor: ConfigOne, props: { prop1: 'prop1 value' } };
    }

    @api enableTwo() {
        this.config = { ctor: ConfigTwo, props: { prop2: 'prop2 value' } };
    }

    @api enableOneAlternateProps() {
        this.config.props.prop1 = 'prop1 alternate value';
    }

    @api disableAll() {
        this.config = null;
    }
}
