import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    t: api_text,
    d: api_dynamic,
    k: api_key,
    h: api_element,
    i: api_iterator,
    f: api_flatten,
  } = $api;
  return [
    api_element(
      "section",
      {
        key: 9,
      },
      api_flatten([
        api_iterator($cmp.items, function (item) {
          return [
            api_element(
              "p",
              {
                key: api_key(2, item.id),
              },
              [api_text("1", 0), api_dynamic(item, 1)]
            ),
            api_element(
              "p",
              {
                key: api_key(5, item.secondId),
              },
              [api_text("2", 3), api_dynamic(item, 4)]
            ),
          ];
        }),
        api_element(
          "p",
          {
            key: 8,
          },
          [api_text("3", 6), api_dynamic($cmp.item, 7)]
        ),
      ])
    ),
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
