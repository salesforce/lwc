import _nsFoo from "ns/foo";
import _nsBar from "ns/bar";
import { registerTemplate, sanitizeAttribute } from "lwc";
const stc0 = [];
const stc1 = {
  classMap: {
    test: true,
  },
  attrs: {
    "data-foo": "datafoo",
    "aria-hidden": "h",
    role: "presentation",
    href: "/foo",
    title: "test",
    tabindex: "-1",
  },
  key: 1,
};
const stc2 = {
  r: true,
};
const stc3 = {
  "data-xx": "foo",
};
const stc4 = {
  classMap: {
    cubano: true,
  },
  attrs: {
    focusable: "true",
  },
  key: 3,
  svg: true,
};
const stc5 = {
  attrs: {
    bgcolor: "x",
  },
  key: 5,
};
const stc6 = {
  "aria-hidden": "hidden",
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { gid: api_scoped_id, c: api_custom_element, h: api_element } = $api;
  return [
    api_custom_element(
      "ns-foo",
      _nsFoo,
      {
        props: {
          d: $cmp.p.foo,
          id: api_scoped_id("ns-foo"),
        },
        key: 0,
      },
      stc0
    ),
    api_element("a", stc1, stc0),
    api_custom_element(
      "ns-bar",
      _nsBar,
      {
        classMap: stc2,
        attrs: stc3,
        props: {
          ariaDescribedBy: api_scoped_id("ns-foo"),
          ariaHidden: "hidden",
          fooBar: "x",
          foo: "bar",
          role: "xx",
          tabIndex: "0",
          bgColor: "blue",
        },
        key: 2,
      },
      stc0
    ),
    api_element("svg", stc4, [
      api_element(
        "use",
        {
          attrs: {
            "xlink:href": sanitizeAttribute(
              "use",
              "http://www.w3.org/2000/svg",
              "xlink:href",
              "xx"
            ),
          },
          key: 4,
          svg: true,
        },
        stc0
      ),
    ]),
    api_element("table", stc5, stc0),
    api_element(
      "div",
      {
        className: $cmp.foo,
        attrs: stc6,
        key: 6,
      },
      stc0
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
