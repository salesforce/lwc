import _implicitStylesheets from "./key-invalid-in-slot.css";
import _implicitScopedStylesheets from "./key-invalid-in-slot.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}>Default fallback</div>`;
const $fragment2 = parseFragment`<div${3}>Named fallback</div>`;
const stc0 = {
  key: 0,
};
const stc1 = {
  attrs: {
    name: "foo",
  },
  key: 3,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment, s: api_slot } = $api;
  return [
    api_slot("", stc0, [api_static_fragment($fragment1, "@:2")], $slotset),
    api_slot(
      "foo",
      stc1,
      [api_static_fragment($fragment2, "@foo:5")],
      $slotset
    ),
  ];
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["", "foo"];
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-1ajl4r27aqe";
tmpl.legacyStylesheetToken = "x-key-invalid-in-slot_key-invalid-in-slot";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
