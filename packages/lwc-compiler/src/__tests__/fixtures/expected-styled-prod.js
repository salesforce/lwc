import _xFoo from"x-foo";import{Element}from"engine";function style(a,b){return`[is=${a}][${b}],${a}[${b}]{color:blue}div[${b}]{color:red}[is=x-foo][${b}],x-foo[${b}]{color:green}`}function tmpl(a){const{h:b,c:c}=a;return[b("div",{key:1},[]),c("x-foo",_xFoo,{key:2},[])]}if(style){const a="x-styled_styled";tmpl.token=a,tmpl.style=style("x-styled",a)}class Styled extends Element{render(){return tmpl}}Styled.style=tmpl.style;export default Styled;
