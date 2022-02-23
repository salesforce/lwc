import { registerTemplate } from "lwc";
const stc0 = [];
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
        api_text("Outer"),
        api_iterator($cmp.items, function (item) {
          return api_element(
            "p",
            {
              key: api_key(0, item.id),
            },
            [api_text("Inner")]
          );
        }),
      ])
    : stc0;
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
