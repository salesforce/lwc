import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p${3}>1</p>`;
const $fragment2 = parseFragment`<p${3}>2</p>`;
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 3,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment, dc: api_dynamic_component } = $api;
  return [
    $cmp.isTrue
      ? api_dynamic_component($cmp.ctor, stc0, [
          api_static_fragment($fragment1(), 2),
        ])
      : null,
    !$cmp.isTrue2
      ? api_dynamic_component($cmp.ctor, stc1, [
          api_static_fragment($fragment2(), 5),
        ])
      : null,
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
