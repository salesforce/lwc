import _nsFoo from "ns/foo";
import _nsBar from "ns/bar";
import { registerTemplate, sanitizeAttribute } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { gid: api_scoped_id, c: api_custom_element, h: api_element } = $api;
  return [
    api_custom_element(
      "ns-foo",
      _nsFoo,
      {
        props: {
          d: $cmp.p.foo,
          id: api_scoped_id("ns-foo")
        },
        key: 0
      },
      []
    ),
    api_element(
      "a",
      {
        attrs: {
          class: "test",
          "data-foo": "datafoo",
          "aria-hidden": "h",
          role: "presentation",
          href: "/foo",
          title: "test",
          tabindex: "-1"
        },
        key: 1
      },
      []
    ),
    api_custom_element(
      "ns-bar",
      _nsBar,
      {
        attrs: {
          "data-xx": "foo"
        },
        props: {
          class: "r",
          ariaDescribedBy: `${api_scoped_id("ns-foo")}`,
          ariaHidden: "hidden",
          fooBar: "x",
          foo: "bar",
          role: "xx",
          tabIndex: "0",
          bgColor: "blue"
        },
        key: 2
      },
      []
    ),
    api_element(
      "svg",
      {
        attrs: {
          class: "cubano",
          focusable: "true"
        },
        key: 4
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
              )
            },
            key: 3
          },
          []
        )
      ]
    ),
    api_element(
      "table",
      {
        attrs: {
          bgcolor: "x"
        },
        key: 5
      },
      []
    ),
    api_element(
      "div",
      {
        attrs: {
          class: $cmp.foo,
          "aria-hidden": "hidden"
        },
        key: 6
      },
      []
    )
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
