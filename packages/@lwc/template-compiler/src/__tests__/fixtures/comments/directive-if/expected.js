import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p${3}>true branch</p>`;
const $fragment2 = parseFragment`<p${3}>false branch</p>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { co: api_comment, st: api_static_fragment } = $api;
  return [
    $cmp.truthyValue ? api_comment(" HTML comment inside if:true ") : null,
    $cmp.truthyValue ? api_static_fragment($fragment1(), 0) : null,
    !$cmp.truthyValue ? api_comment(" HTML comment inside if:false ") : null,
    !$cmp.truthyValue ? api_static_fragment($fragment2(), 1) : null,
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
