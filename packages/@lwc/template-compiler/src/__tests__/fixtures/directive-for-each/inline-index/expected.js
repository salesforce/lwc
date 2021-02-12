import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    k: api_key,
    d: api_dynamic,
    t: api_text,
    h: api_element,
    i: api_iterator
  } = $api;
  return [
    api_element(
      "ul",
      {
        key: 0
      },
      api_iterator($cmp.items, function(item, index) {
        return api_element(
          "li",
          {
            key: api_key(1, item.id)
          },
          [api_dynamic(index), api_text(" - "), api_dynamic(item)]
        );
      })
    )
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
