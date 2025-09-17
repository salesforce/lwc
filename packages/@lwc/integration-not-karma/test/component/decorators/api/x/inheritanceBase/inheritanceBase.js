import { LightningElement, api } from 'lwc';

export default class InheritanceBase extends LightningElement {
    @api base = 'base';
    @api overridden = 'overridden - base';

    @api
    baseMethod() {
        return 'base';
    }

    @api
    overriddenMethod() {
        return 'overridden - base';
    }
}
