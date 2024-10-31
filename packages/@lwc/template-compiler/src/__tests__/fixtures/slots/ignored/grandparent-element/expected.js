import _implicitStylesheets from "./grandparent-element.css";
import _implicitScopedStylesheets from "./grandparent-element.scoped.css?scoped=true";
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
  const { h: api_element, fr: api_fragment, c: api_custom_element } = $api;
  return [
    api_custom_element("x-foo", _xFoo, stc0, [
      api_element("div", stc1, [
        $cmp.isTrue ? api_fragment(2, [api_element("span", stc2)], 0) : null,
      ]),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-4htiliitild";
tmpl.legacyStylesheetToken = "x-grandparent-element_grandparent-element";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
