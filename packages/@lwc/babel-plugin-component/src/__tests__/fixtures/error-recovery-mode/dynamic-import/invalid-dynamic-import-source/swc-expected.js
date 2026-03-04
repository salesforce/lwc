import tmpl from './test.html';
import { LightningElement, registerComponent } from 'lwc';
const __lwc_component_class_internal = registerComponent(
    class Test extends LightningElement {
        async loadComponent() {
            const module = await import(123);
        }
    },
    {
        tmpl: tmpl,
        sel: 'lwc-test',
        apiVersion: 9999999,
    }
);
export default __lwc_component_class_internal;
