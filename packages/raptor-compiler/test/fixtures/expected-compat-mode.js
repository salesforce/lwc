define('x-class_and_template', ['compat/helpers/classCallCheck', 'compat/helpers/createClass', 'compat/helpers/possibleConstructorReturn', 'compat/helpers/inherits', 'engine'], function (_classCallCheck, _createClass, _possibleConstructorReturn, _inherits, engine) {

var _callKey = window.Proxy.callKey;
var _getKey = window.Proxy.getKey;
var _setKey = window.Proxy.setKey;
function tmpl($api, $cmp, $slotset, $ctx) {
    return [_callKey($api, "h", "section", {}, [])];
}

var Test = 1;

var ClassAndTemplate = function (_Element) {
    _inherits(ClassAndTemplate, _Element);

    function ClassAndTemplate() {
        _classCallCheck(this, ClassAndTemplate);

        var _this = _possibleConstructorReturn(this, _callKey(_getKey(ClassAndTemplate, "__proto__") || _callKey(Object, "getPrototypeOf", ClassAndTemplate), "call", this));

        _setKey(_this, "t", Test);
        _setKey(_this, "counter", 0);
        return _this;
    }

    _createClass(ClassAndTemplate, [{
        key: "render",
        value: function render() {
            return tmpl;
        }
    }]);

    return ClassAndTemplate;
}(engine.Element);

return ClassAndTemplate;

});
