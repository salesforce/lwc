import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element(
      "section",
      {
        key: 1
      },
      [
        api_element(
          "p",
          {
            attrs: {
              "data-foo": "1",
              "data-bar-baz": "xyz"
            },
            key: 0
          },
          []
        )
      ]
    )
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
