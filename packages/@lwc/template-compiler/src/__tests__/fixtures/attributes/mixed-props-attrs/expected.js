import _nsFoo from "ns/foo";
import _nsBar from "ns/bar";
import { parseFragment, registerTemplate, sanitizeAttribute } from "lwc";
const $fragment1 = parseFragment`<a class="test${0}" data-foo="datafoo" aria-hidden="h" role="presentation" href="/foo" title="test" tabindex="-1"${2}></a>`;
const $fragment2 = parseFragment`<table bgcolor="x"${3}></table>`;
const stc0 = {
  r: true,
};
const stc1 = {
  "data-xx": "foo",
};
const stc2 = {
  classMap: {
    cubano: true,
  },
  attrs: {
    focusable: "true",
  },
  key: 4,
  svg: true,
};
const stc3 = {
  "aria-hidden": "hidden",
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    gid: api_scoped_id,
    c: api_custom_element,
    st: api_static_fragment,
    h: api_element,
  } = $api;
  return [
    api_custom_element("ns-foo", _nsFoo, {
      props: {
        d: $cmp.p.foo,
        id: api_scoped_id("ns-foo"),
      },
      key: 0,
    }),
    api_static_fragment($fragment1(), 2),
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
    api_element("svg", stc2, [
      api_element("use", {
        attrs: {
          "xlink:href": sanitizeAttribute(
            "use",
            "http://www.w3.org/2000/svg",
            "xlink:href",
            "xx"
          ),
        },
        key: 5,
        svg: true,
      }),
    ]),
    api_static_fragment($fragment2(), 7),
    api_element("div", {
      className: $cmp.foo,
      attrs: stc3,
      key: 8,
    }),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
