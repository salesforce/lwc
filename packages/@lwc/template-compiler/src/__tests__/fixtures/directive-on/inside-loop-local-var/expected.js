import _implicitStylesheets from "./inside-loop-local-var.css";
import _implicitScopedStylesheets from "./inside-loop-local-var.scoped.css?scoped=true";
import _xFoo from "x/foo";
import { freezeTemplate, registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { k: api_key, c: api_custom_element, i: api_iterator } = $api;
  return api_iterator($cmp.someArray, function (item) {
    return api_custom_element("x-foo", _xFoo, {
      key: api_key(0, item.key),
      dynamicOnRaw: item.hello,
      dynamicOn: {
        __proto__: null,
        ...item.hello,
      },
    });
  });
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-7tntl2iqog2";
tmpl.legacyStylesheetToken = "x-inside-loop-local-var_inside-loop-local-var";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
