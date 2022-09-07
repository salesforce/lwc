import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<h1${3}>if condition</h1>`;
const $fragment2 = parseFragment`<h1${3}>elseif condition</h1>`;
const $fragment3 = parseFragment`<h1${3}>else condition</h1>`;
const stc0 = {
  key: 4,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment, dc: api_dynamic_component } = $api;
  return $cmp.visible.if
    ? [api_static_fragment($fragment1(), 1)]
    : $cmp.visible.elseif
    ? [api_static_fragment($fragment2(), 3)]
    : $cmp.visible.elseif2
    ? [api_dynamic_component("x-foo", $cmp.trackedProp.foo, stc0)]
    : [api_static_fragment($fragment3(), 6)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
