import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { d: api_dynamic, k: api_key, h: api_element, i: api_iterator } = $api;
  return [
    api_element(
      "ul",
      {
        key: 2,
      },
      api_iterator($cmp.items, function (item) {
        return api_element(
          "li",
          {
            key: api_key(1, item.key),
          },
          [api_dynamic(item.value, 0)]
        );
      })
    ),
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
