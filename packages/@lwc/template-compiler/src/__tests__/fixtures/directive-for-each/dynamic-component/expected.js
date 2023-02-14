import { registerTemplate } from "lwc";
const stc0 = {
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    k: api_key,
    d: api_dynamic_text,
    t: api_text,
    h: api_element,
    dc: api_dynamic_component,
    i: api_iterator,
  } = $api;
  return api_iterator($cmp.items, function (item) {
    return api_dynamic_component(
      $cmp.ctor,
      {
        key: api_key(0, item.id),
      },
      [api_element("p", stc0, [api_text(api_dynamic_text(item))])]
    );
  });
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
