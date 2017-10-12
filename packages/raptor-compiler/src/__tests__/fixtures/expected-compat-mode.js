define('x-class_and_template', ['babel/helpers/classCallCheck', 'babel/helpers/createClass', 'babel/helpers/possibleConstructorReturn', 'babel/helpers/inherits', 'engine'], function (_classCallCheck, _createClass, _possibleConstructorReturn, _inherits, engine) {

var __getKey = window.Proxy.getKey;
var __callKey = window.Proxy.callKey;
var __setKey = window.Proxy.setKey;
function tmpl($api, $cmp, $slotset, $ctx) {
    var api_element = __getKey($api, "h");

    return [api_element("section", {}, [])];
}

var Test = 1;

var ClassAndTemplate = function (_Element) {
    _inherits(ClassAndTemplate, _Element);

    function ClassAndTemplate() {
        _classCallCheck(this, ClassAndTemplate);

        var _this = _possibleConstructorReturn(this, __callKey(__getKey(ClassAndTemplate, "__proto__") || __callKey(Object, "getPrototypeOf", ClassAndTemplate), "call", this));

        __setKey(_this, "t", Test);
        __setKey(_this, "counter", 0);
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
