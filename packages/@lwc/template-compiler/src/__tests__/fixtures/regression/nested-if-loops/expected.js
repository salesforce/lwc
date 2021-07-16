import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  function if1_1() {
    function foreach2_0(item) {
      return api_element(
        "p",
        {
          key: api_key(0, item.id),
        },
        [api_text("Inner")]
      );
    }
    return api_flatten([
      api_text("Outer"),
      api_iterator($cmp.items, foreach2_0),
    ]);
  }
  const {
    t: api_text,
    k: api_key,
    h: api_element,
    i: api_iterator,
    f: api_flatten,
  } = $api;
  return $cmp.isTrue ? if1_1() : [];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
