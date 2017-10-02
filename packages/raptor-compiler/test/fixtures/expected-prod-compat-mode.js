define('x-class_and_template', ['babel/helpers/classCallCheck', 'babel/helpers/createClass', 'babel/helpers/possibleConstructorReturn', 'babel/helpers/inherits', 'engine'], function (_classCallCheck, _createClass, _possibleConstructorReturn, _inherits, engine) {

var __callKey=window.Proxy.callKey; var __getKey=window.Proxy.getKey; var __setKey=window.Proxy.setKey;function tmpl(a){return[__callKey(a,"h","section",{},[])]}var Test=1; var ClassAndTemplate=function(a){function b(){_classCallCheck(this,b);var a=_possibleConstructorReturn(this,__callKey(__getKey(b,"__proto__")||__callKey(Object,"getPrototypeOf",b),"call",this));return __setKey(a,"t",Test),__setKey(a,"counter",0),a}return _inherits(b,a),_createClass(b,[{key:"render",value:function render(){return tmpl}}]),b}(engine.Element);

return ClassAndTemplate;

});
