import _implicitStylesheets from "./valid.css";
import _implicitScopedStylesheets from "./valid.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
const stc0 = {
  lwc: {
    dom: "manual",
  },
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { shc: api_sanitize_html_content, h: api_element } = $api;
  return [
    api_element("div", {
      props: {
        innerHTML:
          $ctx._sanitizedHtml$0 ||
          ($ctx._sanitizedHtml$0 = api_sanitize_html_content(
            "Hello <b>world</b>!"
          )),
      },
      context: stc0,
      key: 0,
    }),
    api_element("div", {
      props: {
        innerHTML:
          $ctx._rawHtml$1 !== ($ctx._rawHtml$1 = $cmp.greeting)
            ? ($ctx._sanitizedHtml$1 = api_sanitize_html_content($cmp.greeting))
            : $ctx._sanitizedHtml$1,
      },
      context: stc0,
      key: 1,
    }),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-2jeqhu792ub";
tmpl.legacyStylesheetToken = "x-valid_valid";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
