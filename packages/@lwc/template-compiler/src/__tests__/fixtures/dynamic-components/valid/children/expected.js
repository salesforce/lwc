import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<span${3}>hello world!</span>`;
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment, dc: api_dynamic_component } = $api;
  return [
    api_dynamic_component($cmp.ctor, stc0, [
      api_static_fragment($fragment1(), 2),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
