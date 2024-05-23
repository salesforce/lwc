import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<span${3}><!-- front -->${"t2"}<!-- middle -->${"t4"}<!-- back --></span>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic_text,
    sp: api_static_part,
    st: api_static_fragment,
  } = $api;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(2, null, " " + api_dynamic_text($cmp.dynamic) + " "),
      api_static_part(4, null, " " + api_dynamic_text($cmp.text) + " "),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
