function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length,
        r =
            c < 3
                ? target
                : desc === null
                  ? (desc = Object.getOwnPropertyDescriptor(target, key))
                  : desc,
        d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
        r = Reflect.decorate(decorators, target, key, desc);
    else
        for (var i = decorators.length - 1; i >= 0; i--)
            if ((d = decorators[i]))
                r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return (c > 3 && r && Object.defineProperty(target, key, r), r);
}
import tmpl from './test.html';
import { LightningElement, registerComponent } from 'lwc';
var Test;
const __lwc_component_class_internal = registerComponent(
    ((Test = class Test extends LightningElement {
        /*LWC compiler vX.X.X*/
    }),
    _ts_decorate([foo.bar], Test.prototype, 'field', void 0),
    Test),
    {
        tmpl: tmpl,
        sel: 'lwc-test',
        apiVersion: 9999999,
    }
);
export default __lwc_component_class_internal;
const Test = __lwc_component_class_internal;
