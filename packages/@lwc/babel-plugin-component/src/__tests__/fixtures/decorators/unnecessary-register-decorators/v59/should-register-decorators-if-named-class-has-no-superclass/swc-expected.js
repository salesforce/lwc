function _class_call_check(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}
import tmpl from './test.html';
import { registerDecorators, registerComponent } from 'lwc';
var __lwc_component_class_internal = registerComponent(
    registerDecorators(
        function MyClazz() {
            'use strict';
            _class_call_check(this, MyClazz);
        },
        {
            fields: ['foo'],
        }
    ),
    {
        tmpl: tmpl,
        sel: 'lwc-test',
        apiVersion: 59,
    }
);
export default __lwc_component_class_internal;
var MyClazz = __lwc_component_class_internal;
