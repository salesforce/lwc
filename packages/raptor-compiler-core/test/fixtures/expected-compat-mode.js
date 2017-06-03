define('x-class_and_template', ['compat/helpers/classCallCheck', 'compat/helpers/createClass'], function (_classCallCheck, _createClass) {

function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h("section", {}, [])];
}

var Test = 1;

var ClassAndTemplate = function () {
    function ClassAndTemplate() {
        _classCallCheck(this, ClassAndTemplate);

        this.t = Test;

        this.counter = 0;
    }

    _createClass(ClassAndTemplate, [{
        key: "render",
        value: function render() {
            return tmpl;
        }
    }]);

    return ClassAndTemplate;
}();

ClassAndTemplate.publicProps = {
    t: 1
};

return ClassAndTemplate;

});
