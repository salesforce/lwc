import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element(
      "table",
      {
        key: 0,
      },
      [
        api_element(
          "tbody",
          {
            key: 1,
          },
          [
            api_element(
              "tr",
              {
                key: 2,
              },
              []
            ),
          ]
        ),
      ]
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
