import _aB from "a/b";
import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  function if1_1() {
    function foreach2_0(item) {
      return api_element(
        "p",
        {
          key: api_key(1, item.id),
        },
        [api_text("X")]
      );
    }
    return api_iterator($cmp.items, foreach2_0);
  }
  const {
    k: api_key,
    t: api_text,
    h: api_element,
    i: api_iterator,
    c: api_custom_element,
  } = $api;
  return [
    api_custom_element(
      "a-b",
      _aB,
      {
        classMap: {
          s2: true,
        },
        key: 0,
      },
      $cmp.isTrue ? if1_1() : []
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
