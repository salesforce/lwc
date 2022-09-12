import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<h1${3}>if condition</h1>`;
const stc0 = {
  key: 3,
};
const stc1 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    st: api_static_fragment,
    dc: api_dynamic_component,
    fr: api_fragment,
  } = $api;
  return [
    $cmp.visible.if
      ? api_fragment("if-fr0", [api_static_fragment($fragment1(), 2)])
      : api_fragment("if-fr0", [
          $cmp.visible.elseif
            ? api_fragment("if-fr0", [
                api_dynamic_component("x-foo", $cmp.trackedProp.foo, stc0),
              ])
            : api_fragment("if-fr0", stc1),
        ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
