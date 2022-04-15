import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div style="color: blue"${3}></div>`;
const $fragment2 = parseFragment`<div style="color: blue;"${3}></div>`;
const $fragment3 = parseFragment`<div style="color: blue ;"${3}></div>`;
const $fragment4 = parseFragment`<div style="box-shadow: 10px 5px 5px black;"${3}></div>`;
const $fragment5 = parseFragment`<div style="font-size: 12px; background: blue; color:red ;"${3}></div>`;
const $fragment6 = parseFragment`<div style="font-size: 12px;background: blue; color:red ;"${3}></div>`;
const $fragment7 = parseFragment`<div style="background-color:rgba(255,0,0,0.3)"${3}></div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return [
    api_static_fragment($fragment1(), 1),
    api_static_fragment($fragment2(), 3),
    api_static_fragment($fragment3(), 5),
    api_static_fragment($fragment4(), 7),
    api_static_fragment($fragment5(), 9),
    api_static_fragment($fragment6(), 11),
    api_static_fragment($fragment7(), 13),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
