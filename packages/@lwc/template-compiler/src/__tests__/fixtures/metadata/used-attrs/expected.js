import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<section${3}><p${3}>${"t2"}</p></section>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic_text,
    sp: api_static_part,
    st: api_static_fragment,
  } = $api;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(2, null, api_dynamic_text($cmp.obj.sub)),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
