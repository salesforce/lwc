import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic,
    t: api_text,
    k: api_key,
    h: api_element,
    i: api_iterator,
  } = $api;
  return [
    api_element(
      "ul",
      {
        key: 4,
      },
      api_iterator($cmp.items, function (item, index) {
        return api_element(
          "li",
          {
            key: api_key(3, item.id),
          },
          [api_dynamic(index, 0), api_text(" - ", 1), api_dynamic(item, 2)]
        );
      })
    ),
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
