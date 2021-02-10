import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element } = $api;
  return [
    api_element(
      "section",
      {
        key: 0
      },
      [
        api_element(
          "textarea",
          {
            attrs: {
              minlength: "1",
              maxlength: "5",
              "unknown-attr": "should-error"
            },
            key: 1
          },
          [api_text("x")]
        )
      ]
    )
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
