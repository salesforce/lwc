import _implicitStylesheets from "./built-in-element.css";
import _implicitScopedStylesheets from "./built-in-element.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element("a", {
      key: 0,
      dynamicOnRaw: $cmp.hello,
      dynamicOn: {
        __proto__: null,
        ...$cmp.hello,
      },
    }),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-1uv881g6g8o";
tmpl.legacyStylesheetToken = "x-built-in-element_built-in-element";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
