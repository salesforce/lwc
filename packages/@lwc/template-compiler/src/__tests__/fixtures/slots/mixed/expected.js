import _xB from "x/b";
import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}></div>`;
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
const stc2 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    st: api_static_fragment,
    t: api_text,
    i: api_iterator,
    f: api_flatten,
    c: api_custom_element,
    h: api_element,
  } = $api;
  return [
    api_element("div", stc0, [
      api_custom_element(
        "x-b",
        _xB,
        stc1,
        api_flatten([
          $cmp.isLoading ? api_static_fragment($fragment1(), 3) : null,
          $cmp.haveLoadedItems
            ? api_iterator($cmp.menuItems, function (item) {
                return api_text("x");
              })
            : stc2,
        ])
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
