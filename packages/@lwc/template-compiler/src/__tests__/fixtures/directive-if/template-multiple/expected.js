import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p${3}>1</p>`;
const $fragment2 = parseFragment`<p${3}>2</p>`;
const $fragment3 = parseFragment`<p${3}>3</p>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return [
    $cmp.isTrue ? api_static_fragment($fragment1(), 1) : null,
    $cmp.isTrue ? api_static_fragment($fragment2(), 3) : null,
    $cmp.isTrue ? api_static_fragment($fragment3(), 5) : null,
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
