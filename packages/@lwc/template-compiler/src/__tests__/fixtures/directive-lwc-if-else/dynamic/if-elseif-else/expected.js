import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<h1${3}>if condition</h1>`;
const stc0 = {
  key: 2,
};
const stc1 = {
  key: 3,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    st: api_static_fragment,
    t: api_text,
    h: api_element,
    dc: api_dynamic_component,
  } = $api;
  return $cmp.visible.if
    ? [api_static_fragment($fragment1(), 1)]
    : $cmp.visible.elseif
    ? [api_element("h1", stc0, [api_text("elseif condition")])]
    : [api_dynamic_component("x-foo", $cmp.trackedProp.foo, stc1)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
