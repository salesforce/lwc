import tmpl from './test.html';
import lwc, { LightningElement, registerComponent } from 'lwc';
console.log(lwc);
const __lwc_component_class_internal = registerComponent(
    class extends LightningElement {
        /*LWC compiler vX.X.X*/
    },
    {
        tmpl: tmpl,
        sel: 'lwc-test',
        apiVersion: 9999999,
    }
);
export default __lwc_component_class_internal;
