import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  "my-list": true,
};
const stc2 = {
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { k: api_key, t: api_text, h: api_element, i: api_iterator } = $api;
  return [
    api_element(
      "section",
      stc0,
      api_iterator($cmp.items, function (item) {
        return api_element(
          "div",
          {
            classMap: stc1,
            key: api_key(1, item.id),
          },
          [api_element("p", stc2, [api_text("items")])]
        );
      })
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
