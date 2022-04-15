import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}>sibling</div>`;
const stc0 = {
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    st: api_static_fragment,
    dc: api_dynamic_component,
    f: api_flatten,
  } = $api;
  return api_flatten([
    api_static_fragment($fragment1(), 1),
    api_dynamic_component("x-foo", $cmp.trackedProp.foo, stc0),
  ]);
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
