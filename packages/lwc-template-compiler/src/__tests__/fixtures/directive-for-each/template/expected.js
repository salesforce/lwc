import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    t: api_text,
    d: api_dynamic,
    k: api_key,
    h: api_element,
    i: api_iterator
  } = $api;

  return [
    api_element(
      "section",
      {
        key: 2,
        create: () => {},
        update: () => {}
      },
      api_iterator($cmp.items, function(item) {
        return api_element(
          "p",
          {
            key: api_key(4, item.id),
            create: () => {},
            update: () => {}
          },
          [api_text("1"), api_dynamic(item)]
        );
      })
    )
  ];
}

export default registerTemplate(tmpl);
