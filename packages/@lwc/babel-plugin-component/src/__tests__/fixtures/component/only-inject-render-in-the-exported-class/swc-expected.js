import tmpl from './test.html';
import { LightningElement, registerComponent } from 'lwc';
class Test1 extends LightningElement {
    /*LWC compiler vX.X.X*/
}
const __lwc_component_class_internal = registerComponent(
    class Test2 extends LightningElement {
        /*LWC compiler vX.X.X*/
    },
    {
        tmpl: tmpl,
        sel: 'lwc-test',
        apiVersion: 9999999,
    }
);
export default __lwc_component_class_internal;
const Test2 = __lwc_component_class_internal;
