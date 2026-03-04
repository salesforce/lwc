function _assert_this_initialized(self) {
    if (self === void 0) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return self;
}
function _call_super(_this, derived, args) {
    derived = _get_prototype_of(derived);
    return _possible_constructor_return(
        _this,
        _is_native_reflect_construct()
            ? Reflect.construct(derived, args || [], _get_prototype_of(_this).constructor)
            : derived.apply(_this, args)
    );
}
function _class_call_check(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}
function _get_prototype_of(o) {
    _get_prototype_of = Object.setPrototypeOf
        ? Object.getPrototypeOf
        : function getPrototypeOf(o) {
              return o.__proto__ || Object.getPrototypeOf(o);
          };
    return _get_prototype_of(o);
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function');
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            writable: true,
            configurable: true,
        },
    });
    if (superClass) _set_prototype_of(subClass, superClass);
}
function _possible_constructor_return(self, call) {
    if (call && (_type_of(call) === 'object' || typeof call === 'function')) {
        return call;
    }
    return _assert_this_initialized(self);
}
function _set_prototype_of(o, p) {
    _set_prototype_of =
        Object.setPrototypeOf ||
        function setPrototypeOf(o, p) {
            o.__proto__ = p;
            return o;
        };
    return _set_prototype_of(o, p);
}
function _type_of(obj) {
    '@swc/helpers - typeof';
    return obj && typeof Symbol !== 'undefined' && obj.constructor === Symbol
        ? 'symbol'
        : typeof obj;
}
function _is_native_reflect_construct() {
    try {
        var result = !Boolean.prototype.valueOf.call(
            Reflect.construct(Boolean, [], function () {})
        );
    } catch (_) {}
    return (_is_native_reflect_construct = function () {
        return !!result;
    })();
}
import tmpl from './test.html';
import { registerDecorators, registerComponent } from 'lwc';
import MyCoolMixin from './mixin.js';
var foo = registerDecorators(
    /*#__PURE__*/ (function (MyCoolMixin) {
        'use strict';
        _inherits(_class, MyCoolMixin);
        function _class() {
            _class_call_check(this, _class);
            return _call_super(this, _class, arguments);
        }
        return _class;
    })(MyCoolMixin),
    {
        publicProps: {
            foo: {
                config: 0,
            },
        },
    }
);
var __lwc_component_class_internal = registerComponent(foo, {
    tmpl: tmpl,
    sel: 'lwc-test',
    apiVersion: 59,
});
export default __lwc_component_class_internal;
