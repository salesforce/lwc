import { LightningElement } from 'lwc';
import Template from './lockerIntegration.html';
function SecureBase() {
    if (this instanceof SecureBase) {
        LightningElement.prototype.constructor.call(this);
    } else {
        return LightningElement;
    }
}
SecureBase.__circular__ = true;
export default class Foo extends SecureBase {
    render() {
        return Template;
    }
}
