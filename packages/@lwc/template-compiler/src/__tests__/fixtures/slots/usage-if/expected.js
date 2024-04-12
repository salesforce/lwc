import _implicitStylesheets from "./usage-if.css";
import _implicitScopedStylesheets from "./usage-if.scoped.css?scoped=true";
import _nsCmp from "ns/cmp";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
const stc2 = {
  slotAssignment: "",
  key: 2,
};
const stc3 = {
  slotAssignment: "",
  key: 3,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element, c: api_custom_element } = $api;
  return [
    api_element("section", stc0, [
      api_custom_element("ns-cmp", _nsCmp, stc1, [
        $cmp.isTrue ? api_element("p", stc2, [api_text("S1")]) : null,
        api_element("p", stc3, [api_text("S2")]),
      ]),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-6dcki86fmnh";
tmpl.legacyStylesheetToken = "x-usage-if_usage-if";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
