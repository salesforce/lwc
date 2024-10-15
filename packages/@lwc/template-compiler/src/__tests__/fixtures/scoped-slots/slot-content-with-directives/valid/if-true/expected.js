import _implicitStylesheets from "./if-true.css";
import _implicitScopedStylesheets from "./if-true.scoped.css?scoped=true";
import _xCounter from "x/counter";
import _xButton from "x/button";
import _xChild from "x/child";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
const stc2 = {
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    c: api_custom_element,
    fr: api_fragment,
    ssf: api_scoped_slot_factory,
  } = $api;
  return [
    api_custom_element("x-child", _xChild, stc0, [
      api_scoped_slot_factory("", function (variations, key) {
        return api_fragment(
          key,
          [
            variations.variation1
              ? api_custom_element("x-counter", _xCounter, stc1)
              : null,
            variations.variation2
              ? api_custom_element("x-button", _xButton, stc2)
              : null,
          ],
          0
        );
      }),
    ]),
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-6l5rn7c0v7l";
tmpl.legacyStylesheetToken = "x-if-true_if-true";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
