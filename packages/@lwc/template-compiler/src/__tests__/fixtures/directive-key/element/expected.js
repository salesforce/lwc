import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { d: api_dynamic, k: api_key, h: api_element, i: api_iterator } = $api;
  return [
    api_element(
      "ul",
      {
        key: 1
      },
      api_iterator($cmp.items, function(item) {
        return api_element(
          "li",
          {
            key: api_key(0, item.key)
          },
          [api_dynamic(item.value)]
        );
      })
    )
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
