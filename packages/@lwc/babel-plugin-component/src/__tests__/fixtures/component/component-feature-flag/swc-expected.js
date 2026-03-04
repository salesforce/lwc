import componentFeatureFlag from '@salesforce/featureFlag/TEST_FLAG';
import tmpl from './test.html';
import { LightningElement, registerComponent } from 'lwc';
const __lwc_component_class_internal = registerComponent(
    class Test extends LightningElement {
        /*LWC compiler vX.X.X*/
    },
    {
        tmpl: tmpl,
        sel: 'x-test',
        apiVersion: 9999999,
        componentFeatureFlag: {
            value: Boolean(componentFeatureFlag),
            path: '@salesforce/featureFlag/TEST_FLAG',
        },
    }
);
export default __lwc_component_class_internal;
const Test = __lwc_component_class_internal;
