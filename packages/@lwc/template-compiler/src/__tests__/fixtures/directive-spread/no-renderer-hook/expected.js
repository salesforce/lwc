import _implicitStylesheets from "./no-renderer-hook.css";
import _implicitScopedStylesheets from "./no-renderer-hook.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { ddc: api_deprecated_dynamic_component, dc: api_dynamic_component } =
    $api;
  return [
    api_deprecated_dynamic_component("x-foo", $cmp.dynamicCtor, {
      props: {
        ...$cmp.dynamicProps,
      },
      key: 0,
    }),
    api_dynamic_component($cmp.dynamicCtor, {
      props: {
        ...$cmp.dynamicProps,
      },
      key: 1,
    }),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-54kh0v6mpj0";
tmpl.legacyStylesheetToken = "x-no-renderer-hook_no-renderer-hook";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
