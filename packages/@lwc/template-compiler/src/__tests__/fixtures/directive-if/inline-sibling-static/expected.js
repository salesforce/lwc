import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element, d: api_dynamic_text } = $api;
  return [
    api_element(
      "section",
      {
        key: 0,
      },
      [
        $cmp.isTrue
          ? api_element(
              "p",
              {
                key: 1,
              },
              [api_text("1")]
            )
          : null,
        api_text(api_dynamic_text($cmp.foo)),
        $cmp.isTrue
          ? api_element(
              "p",
              {
                key: 2,
              },
              [api_text("3")]
            )
          : null,
      ]
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
