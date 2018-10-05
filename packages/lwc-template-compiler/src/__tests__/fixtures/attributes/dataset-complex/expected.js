import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;

  return [
    api_element(
      "section",
      {
        key: 2
      },
      [
        api_element(
          "p",
          {
            attrs: {
              "data--bar-baz": "xyz"
            },
            key: 1
          },
          []
        )
      ]
    )
  ];
}

export default registerTemplate(tmpl);
