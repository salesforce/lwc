import _implicitStylesheets from "./mixed-props-attrs.css";
import _implicitScopedStylesheets from "./mixed-props-attrs.scoped.css?scoped=true";
import _nsFoo from "ns/foo";
import _nsBar from "ns/bar";
import {
  freezeTemplate,
  parseFragment,
  registerTemplate,
  sanitizeAttribute,
} from "lwc";
const $fragment1 = parseFragment`<a class="test${0}" data-foo="datafoo" aria-hidden="h" role="presentation" href="/foo" title="test" tabindex="-1"${2}></a>`;
const $fragment2 = parseFragment`<svg class="cubano${0}" focusable="true"${2}><use${"a1:xlink:href"}${3}/></svg>`;
const $fragment3 = parseFragment`<table bgcolor="x"${3}></table>`;
const $fragment4 = parseFragment`<div${"c0"} aria-hidden="hidden"${2}></div>`;
const stc0 = {
  r: true,
};
const stc1 = {
  "data-xx": "foo",
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    gid: api_scoped_id,
    c: api_custom_element,
    st: api_static_fragment,
    sp: api_static_part,
    ncls: api_normalize_class_name,
  } = $api;
  return [
    api_custom_element("ns-foo", _nsFoo, {
      props: {
        d: $cmp.p.foo,
        id: api_scoped_id("ns-foo"),
      },
      key: 0,
    }),
    api_static_fragment($fragment1, 2),
    api_custom_element("ns-bar", _nsBar, {
      classMap: stc0,
      attrs: stc1,
      props: {
        ariaDescribedBy: api_scoped_id("ns-foo"),
        ariaHidden: "hidden",
        fooBar: "x",
        foo: "bar",
        role: "xx",
        tabIndex: "0",
        bgColor: "blue",
      },
      key: 3,
    }),
    api_static_fragment($fragment2, 5, [
      api_static_part(
        1,
        {
          attrs: {
            "xlink:href": sanitizeAttribute(
              "use",
              "http://www.w3.org/2000/svg",
              "xlink:href",
              "xx"
            ),
          },
        },
        null
      ),
    ]),
    api_static_fragment($fragment3, 7),
    api_static_fragment($fragment4, 9, [
      api_static_part(
        0,
        {
          className: api_normalize_class_name($cmp.foo),
        },
        null
      ),
    ]),
  ];
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-cfdictrqeg";
tmpl.legacyStylesheetToken = "x-mixed-props-attrs_mixed-props-attrs";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
