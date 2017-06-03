define('x-class_and_template', ['compat/helpers/classCallCheck', 'compat/helpers/createClass'], function (_classCallCheck, _createClass) {

function tmpl(a){return[a.h("section",{},[])]}var Test=1; var ClassAndTemplate=function(){function a(){_classCallCheck(this,a),this.t=Test,this.counter=0;}return _createClass(a,[{key:"render",value:function render(){return tmpl}}]),a}();ClassAndTemplate.publicProps={t:1};

return ClassAndTemplate;

});
