import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p${3}>${"t1"}</p>`;
const $fragment2 = parseFragment`<p${3}>${"t1"}</p>`;
const $fragment3 = parseFragment`<p${3}>${"t1"}</p>`;
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
    f: api_flatten,
    h: api_element,
  } = $api;
  return [
    api_element(
      "section",
      stc0,
      api_flatten([
        api_iterator($cmp.items, function (item) {
          return [
            api_static_fragment($fragment1, api_key(2, item.id), [
              api_static_part(1, null, "1" + api_dynamic_text(item)),
            ]),
            api_static_fragment($fragment2, api_key(4, item.secondId), [
              api_static_part(1, null, "2" + api_dynamic_text(item)),
            ]),
          ];
        }),
        api_static_fragment($fragment3, 6, [
          api_static_part(1, null, "3" + api_dynamic_text($cmp.item)),
        ]),
      ])
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
