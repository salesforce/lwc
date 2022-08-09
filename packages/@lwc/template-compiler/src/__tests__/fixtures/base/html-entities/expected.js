import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p${3}>foo&amp;bar</p>`;
const $fragment2 = parseFragment`<p${3}>const { foo } = bar;</p>`;
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
