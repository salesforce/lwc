import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element } = $api;
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
            key: 3
          },
          [api_text("1")]
        ),
        $cmp.bar
          ? api_element(
              "p",
              {
                key: 5
              },
              [api_text("2")]
            )
          : null,
        api_element(
          "p",
          {
            key: 6
          },
          [api_text("3")]
        )
      ]
    )
  ];
}

export default registerTemplate(tmpl);
