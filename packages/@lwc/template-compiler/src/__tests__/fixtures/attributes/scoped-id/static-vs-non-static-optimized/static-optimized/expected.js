import _implicitStylesheets from "./static-optimized.css";
import _implicitScopedStylesheets from "./static-optimized.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<section class="these-are-dynamic${0}"${2}><div${"a1:aria-describedby"}${"a1:aria-activedescendant"}${"a1:aria-errormessage"}${"a1:aria-flowto"}${"a1:aria-labelledby"}${"a1:for"}${"a1:id"}${3}></div></section>`;
const $fragment2 = parseFragment`<section class="these-are-static${0}"${2}><div${"a1:aria-describedby"}${"a1:aria-activedescendant"}${"a1:aria-errormessage"}${"a1:aria-flowto"}${"a1:aria-labelledby"}${"a1:for"}${"a1:id"}${3}></div></section>`;
const $fragment3 = parseFragment`<section class="these-are-boolean-true${0}"${2}><div aria-describedby aria-activedescendant aria-errormessage aria-flowto aria-labelledby for id${3}></div></section>`;
const $fragment4 = parseFragment`<section class="these-are-the-empty-string${0}"${2}><div${"a1:aria-describedby"}${"a1:aria-activedescendant"}${"a1:aria-errormessage"}${"a1:aria-flowto"}${"a1:aria-labelledby"}${"a1:for"}${"a1:id"}${3}></div></section>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    gid: api_scoped_id,
    sp: api_static_part,
    st: api_static_fragment,
  } = $api;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(
        1,
        {
          attrs: {
            "aria-describedby": api_scoped_id($cmp.scoped),
            "aria-activedescendant": api_scoped_id($cmp.scoped),
            "aria-errormessage": api_scoped_id($cmp.scoped),
            "aria-flowto": api_scoped_id($cmp.scoped),
            "aria-labelledby": api_scoped_id($cmp.scoped),
            for: api_scoped_id($cmp.scoped),
            id: api_scoped_id($cmp.scoped),
          },
        },
        null
      ),
    ]),
    api_static_fragment($fragment2, 3, [
      api_static_part(
        1,
        {
          attrs: {
            "aria-describedby": api_scoped_id("yolo"),
            "aria-activedescendant": api_scoped_id("yolo"),
            "aria-errormessage": api_scoped_id("yolo"),
            "aria-flowto": api_scoped_id("yolo"),
            "aria-labelledby": api_scoped_id("yolo"),
            for: api_scoped_id("yolo"),
            id: api_scoped_id("yolo"),
          },
        },
        null
      ),
    ]),
    api_static_fragment($fragment3, 5),
    api_static_fragment($fragment4, 7, [
      api_static_part(
        1,
        {
          attrs: {
            "aria-describedby": api_scoped_id(""),
            "aria-activedescendant": api_scoped_id(""),
            "aria-errormessage": api_scoped_id(""),
            "aria-flowto": api_scoped_id(""),
            "aria-labelledby": api_scoped_id(""),
            for: api_scoped_id(""),
            id: api_scoped_id(""),
          },
        },
        null
      ),
    ]),
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-7n28hdp1g54";
tmpl.legacyStylesheetToken = "x-static-optimized_static-optimized";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
