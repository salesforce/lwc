import { LightningElement } from 'lwc';
import Template from './child.html';
function SecureBase() {
    if (this instanceof SecureBase) {
        LightningElement.prototype.constructor.call(this);
    } else {
        return LightningElement;
    }
}
SecureBase.__circular__ = true;
class Child extends SecureBase {
    render() {
        return Template;
    }
}

export default function tmp() {
    return Child;
}
tmp.__circular__ = true;
