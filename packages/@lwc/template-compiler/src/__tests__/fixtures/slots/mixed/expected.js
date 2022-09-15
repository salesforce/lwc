import _xB from "x/b";
import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}></div>`;
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    st: api_static_fragment,
    t: api_text,
    i: api_iterator,
    fr: api_fragment,
    c: api_custom_element,
    h: api_element,
  } = $api;
  return [
    api_element("div", stc0, [
      api_custom_element("x-b", _xB, stc1, [
        $cmp.isLoading ? api_static_fragment($fragment1(), 3) : null,
        $cmp.haveLoadedItems
          ? api_fragment(
              "it-fr4",
              api_iterator($cmp.menuItems, function (item) {
                return api_text("x");
              })
            )
          : null,
      ]),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
