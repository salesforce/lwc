import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element } = $api;
  return [
    api_element(
      "h1",
      {
        key: 0,
      },
      [api_text("hello")]
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
