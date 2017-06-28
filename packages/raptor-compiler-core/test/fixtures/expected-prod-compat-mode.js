define('x-class_and_template', ['engine', 'compat/helpers/classCallCheck', 'compat/helpers/createClass'], function (engine, _classCallCheck, _createClass) {

function tmpl(a){return[engine.callKey(a,"h","section",{},[])]}var Test=1; var ClassAndTemplate=function(){function a(){_classCallCheck(this,a),engine.setKey(this,"t",Test),engine.setKey(this,"counter",0);}return _createClass(a,[{key:"render",value:function render(){return tmpl}}]),a}();

return ClassAndTemplate;

});
