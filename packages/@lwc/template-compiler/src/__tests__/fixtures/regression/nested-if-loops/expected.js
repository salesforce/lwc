import { registerTemplate, renderApi } from "lwc";
const {
  t: api_text,
  so: api_set_owner,
  k: api_key,
  h: api_element,
  i: api_iterator,
  f: api_flatten,
} = renderApi;
const $hoisted1 = api_text("Outer", true);
const $hoisted2 = api_text("Inner", true);
const stc0 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  return $cmp.isTrue
    ? api_flatten([
        api_set_owner($hoisted1),
        api_iterator($cmp.items, function (item) {
          return api_element(
            "p",
            {
              key: api_key(0, item.id),
            },
            [api_set_owner($hoisted2)]
          );
        }),
      ])
    : stc0;
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
