import { api } from 'lwc';

// Mixin pattern via https://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/
const Mixin = (superclass) =>
    class extends superclass {
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
    };

export default Mixin;
