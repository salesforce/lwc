import { parseFragment, registerTemplate } from "lwc";
let $fragment1;
const $hoisted1 = parseFragment`<div style="color: blue"${1}${2}></div>`;
let $fragment2;
const $hoisted2 = parseFragment`<div style="color: blue;"${1}${2}></div>`;
let $fragment3;
const $hoisted3 = parseFragment`<div style="color: blue ;"${1}${2}></div>`;
let $fragment4;
const $hoisted4 = parseFragment`<div style="box-shadow: 10px 5px 5px black;"${1}${2}></div>`;
let $fragment5;
const $hoisted5 = parseFragment`<div style="font-size: 12px; background: blue; color:red ;"${1}${2}></div>`;
let $fragment6;
const $hoisted6 = parseFragment`<div style="font-size: 12px;background: blue; color:red ;"${1}${2}></div>`;
let $fragment7;
const $hoisted7 = parseFragment`<div style="background-color:rgba(255,0,0,0.3)"${1}${2}></div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return [
    api_static_fragment($fragment1 || ($fragment1 = $hoisted1()), 1),
    api_static_fragment($fragment2 || ($fragment2 = $hoisted2()), 3),
    api_static_fragment($fragment3 || ($fragment3 = $hoisted3()), 5),
    api_static_fragment($fragment4 || ($fragment4 = $hoisted4()), 7),
    api_static_fragment($fragment5 || ($fragment5 = $hoisted5()), 9),
    api_static_fragment($fragment6 || ($fragment6 = $hoisted6()), 11),
    api_static_fragment($fragment7 || ($fragment7 = $hoisted7()), 13),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
