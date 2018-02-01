define('x-class_and_template', ['proxy-compat/callKey', 'proxy-compat/getKey', 'proxy-compat/setKey', 'babel/helpers/classCallCheck', 'babel/helpers/createClass', 'babel/helpers/possibleConstructorReturn', 'babel/helpers/inherits', 'engine'], function (__callKey, __getKey, __setKey, _classCallCheck, _createClass, _possibleConstructorReturn, _inherits, engine) {

var style = undefined;

function tmpl($api, $cmp, $slotset, $ctx) {
  var api_element = __getKey($api, 'h');

  return [api_element("section", {
      ck: 1
    }, [])];
}

if (style) {
    var tagName = 'x-class_and_template';
    var token = 'x-class_and_template_class_and_template';
    __setKey(tmpl, 'token', token);
    __setKey(tmpl, 'style', style(tagName, token));
}

var Test = 1;

var ClassAndTemplate = function (_Element) {
    _inherits(ClassAndTemplate, _Element);

    function ClassAndTemplate() {
        _classCallCheck(this, ClassAndTemplate);

        var _this = _possibleConstructorReturn(this, __callKey(__getKey(ClassAndTemplate, "__proto__") || Object.getPrototypeOf(ClassAndTemplate), "call", this));

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

__setKey(ClassAndTemplate, "style", __getKey(tmpl, "style"));

return ClassAndTemplate;

});
