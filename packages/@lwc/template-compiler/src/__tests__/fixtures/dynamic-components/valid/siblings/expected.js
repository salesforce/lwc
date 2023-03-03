import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}>before</div>`;
const $fragment2 = parseFragment`<div${3}>after</div>`;
const stc0 = {
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment, dc: api_dynamic_component } = $api;
  return [
    api_static_fragment($fragment1(), 1),
    api_dynamic_component($cmp.trackedProp.foo, stc0),
    api_static_fragment($fragment2(), 4),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
