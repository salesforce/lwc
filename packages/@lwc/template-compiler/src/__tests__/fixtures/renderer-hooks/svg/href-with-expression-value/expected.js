import _implicitStylesheets from "./href-with-expression-value.css";
import _implicitScopedStylesheets from "./href-with-expression-value.scoped.css?scoped=true";
import {
  freezeTemplate,
  parseSVGFragment,
  registerTemplate,
  renderer,
} from "lwc";
const $fragment1 = parseSVGFragment`<circle${"a0:id"} cx="5" cy="5" r="4" stroke="black"${3}/>`;
const stc0 = {
  attrs: {
    viewBox: "0 0 30 10",
    xmlns: "http://www.w3.org/2000/svg",
  },
  key: 0,
  svg: true,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    gid: api_scoped_id,
    sp: api_static_part,
    st: api_static_fragment,
    fid: api_scoped_frag_id,
    h: api_element,
  } = $api;
  return [
    api_element("svg", stc0, [
      api_static_fragment($fragment1, 2, [
        api_static_part(
          0,
          {
            attrs: {
              id: api_scoped_id($cmp.id),
            },
          },
          null
        ),
      ]),
      api_element("use", {
        attrs: {
          href: api_scoped_frag_id($cmp.id),
          x: "10",
          fill: "blue",
        },
        key: 3,
        svg: true,
        renderer: renderer,
      }),
    ]),
  ];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-4i58lt2008n";
tmpl.legacyStylesheetToken =
  "x-href-with-expression-value_href-with-expression-value";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
