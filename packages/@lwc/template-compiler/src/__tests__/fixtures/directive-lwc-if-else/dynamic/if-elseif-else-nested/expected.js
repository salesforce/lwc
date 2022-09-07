import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<h1${3}>outer if</h1>`;
const $fragment2 = parseFragment`<h1${3}>outer elseif</h1>`;
const $fragment3 = parseFragment`<h1${3}>inner if</h1>`;
const $fragment4 = parseFragment`<h1${3}>inner elseif</h1>`;
const $fragment5 = parseFragment`<h1${3}>inner else</h1>`;
const $fragment6 = parseFragment`<h1${3}>outer else</h1>`;
const stc0 = {
  key: 8,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment, dc: api_dynamic_component } = $api;
  return $cmp.outer.if
    ? [api_static_fragment($fragment1(), 1)]
    : $cmp.outer.elseif1
    ? [api_static_fragment($fragment2(), 3)]
    : $cmp.outer.elseif2
    ? $cmp.inner.if
      ? [api_static_fragment($fragment3(), 5)]
      : $cmp.inner.elseif
      ? [api_static_fragment($fragment4(), 7)]
      : $cmp.inner.elseif2
      ? [api_dynamic_component("x-foo", $cmp.trackedProp.foo, stc0)]
      : [api_static_fragment($fragment5(), 10)]
    : [api_static_fragment($fragment6(), 12)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
