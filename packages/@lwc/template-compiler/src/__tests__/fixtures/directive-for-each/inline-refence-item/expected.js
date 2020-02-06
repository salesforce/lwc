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
            attrs: {
              class: item.x
            },
            key: api_key(0, item.id)
          },
          [api_dynamic(item)]
        );
      })
    )
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
