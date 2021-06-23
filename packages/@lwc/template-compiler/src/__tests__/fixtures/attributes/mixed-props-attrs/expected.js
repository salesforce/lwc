import _nsFoo from "ns/foo";
import _nsBar from "ns/bar";
import { sanitizeAttribute, registerTemplate } from "lwc";
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
      []
    ),
    api_element(
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
      []
    ),
    api_custom_element(
      "ns-bar",
      _nsBar,
      {
        classMap: {
          r: true,
        },
        attrs: {
          "data-xx": "foo",
        },
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
      []
    ),
    api_element(
      "svg",
      {
        classMap: {
          cubano: true,
        },
        attrs: {
          focusable: "true",
        },
        key: 3,
      },
      [
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
          },
          []
        ),
      ]
    ),
    api_element(
      "table",
      {
        attrs: {
          bgcolor: "x",
        },
        key: 5,
      },
      []
    ),
    api_element(
      "div",
      {
        className: $cmp.foo,
        attrs: {
          "aria-hidden": "hidden",
        },
        key: 6,
      },
      []
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
