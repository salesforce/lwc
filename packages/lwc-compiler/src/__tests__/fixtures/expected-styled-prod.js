import _xFoo from"x-foo";import{Element}from"engine";function style(a,b){return`[is=${a}][${b}],${a}[${b}]{color:blue}div[${b}]{color:red}[is=x-foo][${b}],x-foo[${b}]{color:green}`}function tmpl(a){const{h:b,c:c}=a;return[b("div",{key:1},[]),c("x-foo",_xFoo,{key:2},[])]}if(style){tmpl.token="x-styled_styled";const a=document.createElement("style");a.type="text/css",a.dataset.token="x-styled_styled",a.textContent=style("x-styled","x-styled_styled"),document.head.appendChild(a)}class Styled extends Element{render(){return tmpl}}Styled.style=tmpl.style;export default Styled;
