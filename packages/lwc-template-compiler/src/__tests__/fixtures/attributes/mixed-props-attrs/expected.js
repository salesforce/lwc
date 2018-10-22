import _nsFoo from "ns/foo";
import _nsBar from "ns/bar";
import _nsBuzz from "ns/buzz";
import _nsTable from "ns/table";
import _nsInput from "ns/input";
import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { gid: api_scoped_id, c: api_custom_element, h: api_element } = $api;

  return [
    api_custom_element(
      "ns-foo",
      _nsFoo,
      {
        props: {
          d: $cmp.p.foo,
          id: api_scoped_id("ns-foo", 2)
        },
        key: 2
      },
      []
    ),
    api_element(
      "a",
      {
        classMap: {
          test: true
        },
        attrs: {
          "data-foo": "datafoo",
          "aria-hidden": "h",
          role: "presentation",
          href: "/foo",
          title: "test",
          tabindex: "-1"
        },
        key: 3,
        update: () => {}
      },
      []
    ),
    api_custom_element(
      "ns-bar",
      _nsBar,
      {
        classMap: {
          r: true
        },
        attrs: {
          "data-xx": "foo"
        },
        props: {
          ariaDescribedBy: api_scoped_id("ns-foo", 2),
          ariaHidden: "hidden",
          fooBar: "x",
          foo: "bar",
          role: "xx",
          tabIndex: "0",
          bgColor: "blue"
        },
        key: 4,
        update: () => {}
      },
      []
    ),
    api_element(
      "svg",
      {
        classMap: {
          cubano: true
        },
        attrs: {
          focusable: "true"
        },
        key: 5,
        update: () => {}
      },
      [
        api_element(
          "use",
          {
            attrs: {
              "xlink:href": "xx"
            },
            key: 6,
            update: () => {}
          },
          []
        )
      ]
    ),
    api_custom_element(
      "div",
      _nsBuzz,
      {
        attrs: {
          is: "ns-buzz"
        },
        props: {
          bgColor: "x",
          ariaHidden: "hidden"
        },
        key: 7,
        update: () => {}
      },
      []
    ),
    api_element(
      "table",
      {
        attrs: {
          bgcolor: "x"
        },
        key: 8,
        update: () => {}
      },
      []
    ),
    api_custom_element(
      "table",
      _nsTable,
      {
        attrs: {
          is: "ns-table"
        },
        props: {
          bgColor: "x",
          tabIndex: "0",
          bar: "test",
          min: "3"
        },
        key: 9,
        update: () => {}
      },
      []
    ),
    api_custom_element(
      "input",
      _nsInput,
      {
        attrs: {
          is: "ns-input"
        },
        props: {
          minLength: "3",
          maxLength: "10"
        },
        key: 10,
        update: () => {}
      },
      []
    ),
    api_element(
      "div",
      {
        className: $cmp.foo,
        attrs: {
          "aria-hidden": "hidden"
        },
        key: 11
      },
      []
    )
  ];
}

export default registerTemplate(tmpl);
