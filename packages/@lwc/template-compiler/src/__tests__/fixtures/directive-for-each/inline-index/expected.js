import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic,
    t: api_text,
    k: api_key,
    h: api_element,
    i: api_iterator
  } = $api;
  return [
    api_element(
      "ul",
      {
        key: 1
      },
      api_iterator($cmp.items, function(item, index) {
        return api_element(
          "li",
          {
            key: api_key(0, item.id)
          },
          [api_dynamic(index), api_text(" - "), api_dynamic(item)]
        );
      })
    )
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
