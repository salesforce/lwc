import _aB from "a/b";
import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p${3}>X</p>`;
const stc0 = {
  classMap: {
    s2: true,
  },
  key: 0,
};
const stc1 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    k: api_key,
    st: api_static_fragment,
    i: api_iterator,
    c: api_custom_element,
  } = $api;
  return [
    api_custom_element(
      "a-b",
      _aB,
      stc0,
      $cmp.isTrue
        ? api_iterator($cmp.items, function (item) {
            return api_static_fragment($fragment1, api_key(2, item.id));
          })
        : stc1
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
