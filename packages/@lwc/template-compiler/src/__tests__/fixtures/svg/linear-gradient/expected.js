import _implicitStylesheets from "./linear-gradient.css";
import _implicitScopedStylesheets from "./linear-gradient.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<svg height="150" width="400"${3}><defs${3}><linearGradient${"a2:id"} x1="0%" y1="0%" x2="100%" y2="0%"${3}><stop offset="0%" style="stop-color: rgb(255,255,0); stop-opacity: 1;"${3}/><stop offset="100%" style="stop-color: rgb(255,0,0); stop-opacity: 1;"${3}/></linearGradient></defs><ellipse cx="200" cy="70" rx="85" ry="55" fill="url(#grad1)"${3}/></svg>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    gid: api_scoped_id,
    sp: api_static_part,
    st: api_static_fragment,
  } = $api;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(
        2,
        {
          attrs: {
            id: api_scoped_id("grad1"),
          },
        },
        null
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-1nbpngf4dh9";
tmpl.legacyStylesheetToken = "x-linear-gradient_linear-gradient";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
