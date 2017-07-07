define('x-class_and_template', ['engine', 'compat/helpers/classCallCheck', 'compat/helpers/createClass', 'compat/helpers/possibleConstructorReturn', 'compat/helpers/inherits'], function (engine, _classCallCheck, _createClass, _possibleConstructorReturn, _inherits) {

function tmpl(a){return[engine.callKey(a,"h","section",{},[])]}var Test=1; var ClassAndTemplate=function(a){function b(){_classCallCheck(this,b);var a=_possibleConstructorReturn(this,engine.callKey(engine.getKey(b,"__proto__")||engine.callKey(Object,"getPrototypeOf",b),"call",this));return engine.setKey(a,"t",Test),engine.setKey(a,"counter",0),a}return _inherits(b,a),_createClass(b,[{key:"render",value:function render(){return tmpl}}]),b}(engine.Element);

return ClassAndTemplate;

});
