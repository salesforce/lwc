import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    k: api_key,
    d: api_dynamic_text,
    t: api_text,
    h: api_element,
    i: api_iterator,
    f: api_flatten,
  } = $api;
  return [
    api_element(
      "ul",
      stc0,
      api_flatten([
        api_iterator($cmp.items, function (item) {
          return api_element(
            "li",
            {
              className: item.x,
              key: api_key(1, item.id),
            },
            [api_text(api_dynamic_text(item))]
          );
        }),
        api_element("li", stc1, [api_text("Last")]),
      ])
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
