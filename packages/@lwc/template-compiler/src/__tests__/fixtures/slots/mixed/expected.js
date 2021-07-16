import _xB from "x/b";
import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  function if2_1() {
    function foreach3_0(item) {
      return api_text("x");
    }
    return api_iterator($cmp.menuItems, foreach3_0);
  }
  function if1_0() {
    return api_element(
      "div",
      {
        key: 2,
      },
      []
    );
  }
  const {
    h: api_element,
    t: api_text,
    i: api_iterator,
    f: api_flatten,
    c: api_custom_element,
  } = $api;
  return [
    api_element(
      "div",
      {
        key: 0,
      },
      [
        api_custom_element(
          "x-b",
          _xB,
          {
            key: 1,
          },
          api_flatten([
            $cmp.isLoading ? if1_0() : null,
            $cmp.haveLoadedItems ? if2_1() : [],
          ])
        ),
      ]
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
