import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic,
    k: api_key,
    h: api_element,
    i: api_iterator,
    t: api_text,
    f: api_flatten,
  } = $api;
  return [
    api_element(
      "ul",
      {
        key: 4,
      },
      api_flatten([
        api_iterator($cmp.items, function (item) {
          return api_element(
            "li",
            {
              className: item.x,
              key: api_key(1, item.id),
            },
            [api_dynamic(item, 0)]
          );
        }),
        api_element(
          "li",
          {
            key: 3,
          },
          [api_text("Last", 2)]
        ),
      ])
    ),
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
