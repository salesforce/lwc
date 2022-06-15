import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p${3}>1</p>`;
const $fragment2 = parseFragment`<p${3}>2</p>`;
const $fragment3 = parseFragment`<p${3}>3</p>`;
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment, h: api_element } = $api;
  return [
    api_element("section", stc0, [
      $cmp.isTrue ? api_static_fragment($fragment1(), 2) : null,
      $cmp.isTrue ? api_static_fragment($fragment2(), 4) : null,
      $cmp.isTrue ? api_static_fragment($fragment3(), 6) : null,
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
