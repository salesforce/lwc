import { registerTemplate } from "lwc";
const stc0 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { k: api_key, h: api_element } = $api;
  return [
    api_element(
      "div",
      {
        key: api_key(0, $cmp.keyGetter),
      },
      stc0
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
