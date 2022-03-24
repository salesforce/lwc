import _nsFoo from "ns/foo";
import _nsBar from "ns/bar";
import { registerTemplate, renderApi, sanitizeAttribute } from "lwc";
const { gid: api_scoped_id, c: api_custom_element, h: api_element } = renderApi;
const $hoisted1 = api_element(
  "a",
  {
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
  },
  [],
  true
);
const $hoisted2 = api_element(
  "svg",
  {
    classMap: {
      cubano: true,
    },
    attrs: {
      focusable: "true",
    },
    key: 3,
    svg: true,
  },
  [
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
  ],
  true
);
const $hoisted3 = api_element(
  "table",
  {
    attrs: {
      bgcolor: "x",
    },
    key: 5,
  },
  [],
  true
);
const stc0 = {
  r: true,
};
const stc1 = {
  "data-xx": "foo",
};
const stc2 = {
  "aria-hidden": "hidden",
};
function tmpl($api, $cmp, $slotset, $ctx) {
  return [
    api_custom_element("ns-foo", _nsFoo, {
      props: {
        d: $cmp.p.foo,
        id: api_scoped_id("ns-foo"),
      },
      key: 0,
    }),
    $hoisted1,
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
      key: 2,
    }),
    $hoisted2,
    $hoisted3,
    api_element("div", {
      className: $cmp.foo,
      attrs: stc2,
      key: 6,
    }),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
