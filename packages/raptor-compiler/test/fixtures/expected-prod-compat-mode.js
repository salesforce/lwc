define('x-class_and_template', ['compat/helpers/classCallCheck', 'compat/helpers/createClass', 'compat/helpers/possibleConstructorReturn', 'compat/helpers/inherits', 'engine'], function (_classCallCheck, _createClass, _possibleConstructorReturn, _inherits, engine) {

var _callKey=window.Proxy.callKey; var _getKey=window.Proxy.getKey; var _setKey=window.Proxy.setKey;function tmpl(a){return[_callKey(a,"h","section",{},[])]}var Test=1; var ClassAndTemplate=function(a){function b(){_classCallCheck(this,b);var a=_possibleConstructorReturn(this,_callKey(_getKey(b,"__proto__")||_callKey(Object,"getPrototypeOf",b),"call",this));return _setKey(a,"t",Test),_setKey(a,"counter",0),a}return _inherits(b,a),_createClass(b,[{key:"render",value:function render(){return tmpl}}]),b}(engine.Element);

return ClassAndTemplate;

});
