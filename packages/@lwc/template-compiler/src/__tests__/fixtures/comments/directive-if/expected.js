import { parseFragment, registerTemplate } from "lwc";
let $fragment1;
const $hoisted1 = parseFragment`<p${1}${2}>true branch</p>`;
let $fragment2;
const $hoisted2 = parseFragment`<p${1}${2}>false branch</p>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { co: api_comment, st: api_static_fragment } = $api;
  return [
    $cmp.truthyValue ? api_comment(" HTML comment inside if:true ") : null,
    $cmp.truthyValue
      ? api_static_fragment($fragment1 || ($fragment1 = $hoisted1()), 1)
      : null,
    !$cmp.truthyValue ? api_comment(" HTML comment inside if:false ") : null,
    !$cmp.truthyValue
      ? api_static_fragment($fragment2 || ($fragment2 = $hoisted2()), 3)
      : null,
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
