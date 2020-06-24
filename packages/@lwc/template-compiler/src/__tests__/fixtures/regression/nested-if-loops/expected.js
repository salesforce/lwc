import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    t: api_text,
    k: api_key,
    h: api_element,
    i: api_iterator,
    f: api_flatten,
  } = $api;
  return $cmp.isTrue
    ? api_flatten([
        api_text("Outer", 0),
        api_iterator($cmp.items, function (item) {
          return api_element(
            "p",
            {
              key: api_key(2, item.id),
            },
            [api_text("Inner", 1)]
          );
        }),
      ])
    : [];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
