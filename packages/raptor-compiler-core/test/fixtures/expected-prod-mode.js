define('x-class_and_template', function () {

function tmpl(a){return[a.h("section",{},[])]}const Test=1;class ClassAndTemplate{constructor(){this.t=Test,this.counter=0;}render(){return tmpl}}ClassAndTemplate.publicProps={t:1};

return ClassAndTemplate;

});
