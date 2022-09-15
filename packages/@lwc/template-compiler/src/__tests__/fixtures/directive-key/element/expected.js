import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    k: api_key,
    d: api_dynamic_text,
    t: api_text,
    h: api_element,
    i: api_iterator,
  } = $api;
  return [
    api_element(
      "ul",
      stc0,
      api_iterator($cmp.items, function (item) {
        return api_element(
          "li",
          {
            key: api_key(1, item.key),
          },
          [api_text(api_dynamic_text(item.value))]
        );
      })
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
