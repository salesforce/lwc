import { registerTemplate, renderApi } from "lwc";
const {
  k: api_key,
  d: api_dynamic_text,
  t: api_text,
  h: api_element,
  i: api_iterator,
  f: api_flatten,
} = renderApi;
const $hoisted1 = api_element(
  "li",
  {
    key: 2,
  },
  [api_text("Last")],
  true
);
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
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
        $hoisted1,
      ])
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
