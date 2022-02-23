import _nsFoo from "ns/foo";
import _nsBar from "ns/bar";
import { registerTemplate, sanitizeAttribute } from "lwc";
const stc0 = {
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
const stc1 = {
  r: true,
};
const stc2 = {
  "data-xx": "foo",
};
const stc3 = {
  classMap: {
    cubano: true,
  },
  attrs: {
    focusable: "true",
  },
  key: 3,
  svg: true,
};
const stc4 = {
  attrs: {
    bgcolor: "x",
  },
  key: 5,
};
const stc5 = {
  "aria-hidden": "hidden",
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { gid: api_scoped_id, c: api_custom_element, h: api_element } = $api;
  return [
    api_custom_element("ns-foo", _nsFoo, {
      props: {
        d: $cmp.p.foo,
        id: api_scoped_id("ns-foo"),
      },
      key: 0,
    }),
    api_element("a", stc0),
    api_custom_element("ns-bar", _nsBar, {
      classMap: stc1,
      attrs: stc2,
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
    }),
    api_element("svg", stc3, [
      api_element("use", {
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
      }),
    ]),
    api_element("table", stc4),
    api_element("div", {
      className: $cmp.foo,
      attrs: stc5,
      key: 6,
    }),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
