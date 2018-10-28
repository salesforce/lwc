import _xFoo from"x/foo";import{registerTemplate,LightningElement}from"lwc";function stylesheet(a,b){return`
${a}{color:blue}
div${b}{color:red}
x-foo${b}{color:green}
`}var stylesheets=[stylesheet];function tmpl(a){const{h:b,c:c}=a;return[b("div",{key:2},[]),c("x-foo",_xFoo,{key:3},[])]}var _tmpl=registerTemplate(tmpl);stylesheets&&(tmpl.stylesheets={stylesheets,hostAttribute:"x-styled_styled-host",shadowAttribute:"x-styled_styled"});class Styled extends LightningElement{render(){return _tmpl}}export default Styled;
