import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element(
      "div",
      {
        classMap: {
          foo: true
        },
        key: 1
      },
      []
    ),
    api_element(
      "div",
      {
        classMap: {
          foo: true,
          bar: true
        },
        key: 2
      },
      []
    ),
    api_element(
      "div",
      {
        classMap: {
          foo: true,
          bar: true
        },
        key: 3
      },
      []
    ),
    api_element(
      "div",
      {
        classMap: {
          foo: true,
          bar: true
        },
        key: 4
      },
      []
    )
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
