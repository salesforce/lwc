import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<li${3}>${"t1"}</li>`;
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    k: api_key,
    d: api_dynamic_text,
    sp: api_static_part,
    st: api_static_fragment,
    i: api_iterator,
    h: api_element,
  } = $api;
  return [
    api_element(
      "ul",
      stc0,
      api_iterator($cmp.items, function (item, index) {
        return api_static_fragment($fragment1, api_key(2, item.id), [
          api_static_part(
            1,
            null,
            api_dynamic_text(index) + " - " + api_dynamic_text(item)
          ),
        ]);
      })
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
