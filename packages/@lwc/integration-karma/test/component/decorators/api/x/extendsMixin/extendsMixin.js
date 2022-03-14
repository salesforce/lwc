import { api, LightningElement } from 'lwc';
import Mixin from 'x/mixin';

export default class extends Mixin(LightningElement) {
    @api child = 'child';
    @api overridden = 'overridden - child';

    @api
    childMethod() {
        return 'child';
    }

    @api
    overriddenMethod() {
        return 'overridden - child';
    }
}
