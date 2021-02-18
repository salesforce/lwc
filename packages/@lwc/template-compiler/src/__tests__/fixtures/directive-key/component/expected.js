import _nsItem from "ns/item";
import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    k: api_key,
    d: api_dynamic,
    c: api_custom_element,
    i: api_iterator,
    h: api_element,
  } = $api;
  return [
    api_element(
      "ul",
      {
        key: 0,
      },
      api_iterator($cmp.items, function (item) {
        return api_custom_element(
          "ns-item",
          _nsItem,
          {
            key: api_key(1, item.key),
          },
          [api_dynamic(item.value)]
        );
      })
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
