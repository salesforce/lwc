import { api } from 'lwc';
import InheritanceBase from 'c/inheritanceBase';

export default class Inheritance extends InheritanceBase {
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
