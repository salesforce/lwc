import { LightningElement, api } from 'lwc';

// W-23508928: like `api-prop-in-file-superclass`, but the leaf is exported via a separate
// `export default Foo` statement rather than an inline `export default class`. This exercises the
// binding-resolution branch that identifies the exported leaf so it is not double-registered.
class Base extends LightningElement {
    @api value;
    @api level;
}

class Component extends Base {}

export default Component;
