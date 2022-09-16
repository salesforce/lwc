import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    k: api_key,
    d: api_dynamic_text,
    t: api_text,
    h: api_element,
    i: api_iterator,
  } = $api;
  return api_iterator($cmp.items, function (item) {
    return api_element(
      "p",
      {
        key: api_key(0, item.id),
      },
      [api_text(api_dynamic_text(item))]
    );
  });
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
