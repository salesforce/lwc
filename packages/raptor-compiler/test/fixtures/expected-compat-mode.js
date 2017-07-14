define('x-class_and_template', ['engine', 'compat/helpers/classCallCheck', 'compat/helpers/createClass', 'compat/helpers/possibleConstructorReturn', 'compat/helpers/inherits'], function (engine, _classCallCheck, _createClass, _possibleConstructorReturn, _inherits) {

function tmpl($api, $cmp, $slotset, $ctx) {
    return [engine.callKey($api, "h", "section", {}, [])];
}

var Test = 1;

var ClassAndTemplate = function (_Element) {
    _inherits(ClassAndTemplate, _Element);

    function ClassAndTemplate() {
        _classCallCheck(this, ClassAndTemplate);

        var _this = _possibleConstructorReturn(this, engine.callKey(engine.getKey(ClassAndTemplate, "__proto__") || engine.callKey(Object, "getPrototypeOf", ClassAndTemplate), "call", this));

        engine.setKey(_this, "t", Test);
        engine.setKey(_this, "counter", 0);
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
