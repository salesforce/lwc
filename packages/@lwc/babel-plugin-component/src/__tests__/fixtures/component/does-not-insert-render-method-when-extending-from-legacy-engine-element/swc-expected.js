import tmpl from './test.html';
import { registerComponent } from 'lwc';
import { Element } from 'engine';
const __lwc_component_class_internal = registerComponent(
    class Test extends Element {
        /*LWC compiler vX.X.X*/
    },
    {
        tmpl: tmpl,
        sel: 'lwc-test',
        apiVersion: 9999999,
    }
);
export default __lwc_component_class_internal;
const Test = __lwc_component_class_internal;
