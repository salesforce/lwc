import _implicitStylesheets from "./definition.css";
import _implicitScopedStylesheets from "./definition.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  attrs: {
    name: "head",
  },
  key: 1,
};
const stc2 = [];
const stc3 = {
  attrs: {
    name: "body",
  },
  key: 2,
};
const stc4 = {
  attrs: {
    name: "footer",
  },
  key: 3,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { s: api_slot, dc: api_dynamic_component } = $api;
  return [
    api_dynamic_component($cmp.ctor, stc0, [
      api_slot("head", stc1, stc2, $slotset),
      api_slot("body", stc3, stc2, $slotset),
      api_slot("footer", stc4, stc2, $slotset),
    ]),
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["body", "footer", "head"];
tmpl.renderMode = "light";
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-4ksn4idai2c";
tmpl.legacyStylesheetToken = "x-definition_definition";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
