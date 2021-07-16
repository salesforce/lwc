import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  function if1_0() {
    return api_element(
      "p",
      {
        key: 2,
      },
      [api_text("2")]
    );
  }
  const { t: api_text, h: api_element } = $api;
  return [
    api_element(
      "section",
      {
        key: 0,
      },
      [
        api_element(
          "p",
          {
            key: 1,
          },
          [api_text("1")]
        ),
        $cmp.bar ? if1_0() : null,
        api_element(
          "p",
          {
            key: 3,
          },
          [api_text("3")]
        ),
      ]
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
