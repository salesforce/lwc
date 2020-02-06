import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element(
      "div",
      {
        attrs: {
          class: "foo"
        },
        key: 0
      },
      []
    ),
    api_element(
      "div",
      {
        attrs: {
          class: "foo bar"
        },
        key: 1
      },
      []
    ),
    api_element(
      "div",
      {
        attrs: {
          class: " foo bar   "
        },
        key: 2
      },
      []
    ),
    api_element(
      "div",
      {
        attrs: {
          class: "foo   bar"
        },
        key: 3
      },
      []
    )
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
