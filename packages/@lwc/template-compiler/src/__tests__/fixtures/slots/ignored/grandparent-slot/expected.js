import _implicitStylesheets from "./grandparent-slot.css";
import _implicitScopedStylesheets from "./grandparent-slot.scoped.css?scoped=true";
import _xFoo from "x/foo";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
const stc2 = {
  slotAssignment: "foo",
  key: 3,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    h: api_element,
    fr: api_fragment,
    s: api_slot,
    c: api_custom_element,
  } = $api;
  return [
    api_custom_element("x-foo", _xFoo, stc0, [
      api_slot(
        "",
        stc1,
        [$cmp.isTrue ? api_fragment(2, [api_element("span", stc2)], 0) : null],
        $slotset
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = [""];
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-g41ii4u05q";
tmpl.legacyStylesheetToken = "x-grandparent-slot_grandparent-slot";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
