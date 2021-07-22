import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, d: api_dynamic, h: api_element } = $api;
  return [
    api_element(
      "div",
      {
        key: 0,
      },
      [
        api_element(
          "unkonwn",
          {
            key: 1,
          },
          [api_text("this is "), api_dynamic($cmp.myValue)]
        ),
      ]
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
