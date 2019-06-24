import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element } = $api;
  return [
    api_element(
      "section",
      {
        key: 3
      },
      [
        api_element(
          "p",
          {
            key: 0
          },
          [api_text("1")]
        ),
        $cmp.bar
          ? api_element(
              "p",
              {
                key: 1
              },
              [api_text("2")]
            )
          : null,
        api_element(
          "p",
          {
            key: 2
          },
          [api_text("3")]
        )
      ]
    )
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
