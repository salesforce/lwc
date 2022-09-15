import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 3,
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
      "section",
      stc0,
      api_flatten([
        api_iterator($cmp.items, function (item) {
          return [
            api_element(
              "p",
              {
                key: api_key(1, item.id),
              },
              [api_text("1" + api_dynamic_text(item))]
            ),
            api_element(
              "p",
              {
                key: api_key(2, item.secondId),
              },
              [api_text("2" + api_dynamic_text(item))]
            ),
          ];
        }),
        api_element("p", stc1, [api_text("3" + api_dynamic_text($cmp.item))]),
      ])
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
