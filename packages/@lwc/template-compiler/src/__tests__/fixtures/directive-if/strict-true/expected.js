import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element } = $api;
  return [
    api_element(
      "section",
      {
        key: 0,
      },
      [
        $cmp.isTrue === true
          ? api_element(
              "p",
              {
                key: 1,
              },
              [api_text("1")]
            )
          : null,
      ]
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
