import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element } = $api;
  return [
    api_element(
      "section",
      {
        key: 6,
      },
      [
        api_element(
          "p",
          {
            key: 1,
          },
          [api_text("1", 0)]
        ),
        $cmp.bar
          ? api_element(
              "p",
              {
                key: 3,
              },
              [api_text("2", 2)]
            )
          : null,
        api_element(
          "p",
          {
            key: 5,
          },
          [api_text("3", 4)]
        ),
      ]
    ),
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
