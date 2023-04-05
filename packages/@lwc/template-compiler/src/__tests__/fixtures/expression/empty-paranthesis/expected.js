import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div data-foo="{}"${3}></div>`;
const $fragment2 = parseFragment`<div${3}>{}</div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return [
    api_static_fragment($fragment1(), 1),
    api_static_fragment($fragment2(), 3),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
