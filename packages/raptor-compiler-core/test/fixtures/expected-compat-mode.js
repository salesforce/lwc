define('x-class_and_template', ['engine', 'compat/helpers/classCallCheck', 'compat/helpers/createClass'], function (engine, _classCallCheck, _createClass) {

function tmpl($api, $cmp, $slotset, $ctx) {
    return [engine.getKey($api, "h")("section", {}, [])];
}

var Test = 1;

var ClassAndTemplate = function () {
    function ClassAndTemplate() {
        _classCallCheck(this, ClassAndTemplate);

        engine.setKey(this, "t", Test);

        engine.setKey(this, "counter", 0);
    }

    _createClass(ClassAndTemplate, [{
        key: "render",
        value: function render() {
            return tmpl;
        }
    }]);

    return ClassAndTemplate;
}();

return ClassAndTemplate;

});
