import _implicitStylesheets from "./xlink-with-literal-value.css";
import _implicitScopedStylesheets from "./xlink-with-literal-value.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate, renderer } from "lwc";
const stc0 = {
  classMap: {
    "slds-icon": true,
  },
  attrs: {
    "aria-hidden": "true",
    title: "when needed",
  },
  key: 0,
  svg: true,
};
const stc1 = {
  "xlink:href": "/assets/icons/standard-sprite/svg/symbols.svg#case",
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element("svg", stc0, [
      api_element("use", {
        attrs: stc1,
        key: 1,
        svg: true,
        renderer: renderer,
      }),
    ]),
  ];
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-59dgv24hpm8";
tmpl.legacyStylesheetToken =
  "x-xlink-with-literal-value_xlink-with-literal-value";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
