import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<h1${3}>if condition</h1>`;
const $fragment2 = parseFragment`<h1${3}>elseif condition</h1>`;
const stc0 = {
  key: 5,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    st: api_static_fragment,
    fr: api_fragment,
    ddc: api_deprecated_dynamic_component,
  } = $api;
  return [
    $cmp.visible.if
      ? api_fragment(0, [api_static_fragment($fragment1(), 2)], 0)
      : $cmp.visible.elseif
      ? api_fragment(0, [api_static_fragment($fragment2(), 4)], 0)
      : api_fragment(
          0,
          [
            api_deprecated_dynamic_component(
              "x-foo",
              $cmp.trackedProp.foo,
              stc0
            ),
          ],
          0
        ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
