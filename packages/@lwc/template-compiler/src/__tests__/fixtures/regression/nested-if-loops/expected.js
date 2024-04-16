import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p${3}>Inner</p>`;
const stc0 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    t: api_text,
    k: api_key,
    st: api_static_fragment,
    i: api_iterator,
    f: api_flatten,
  } = $api;
  return $cmp.isTrue
    ? api_flatten([
        api_text("Outer"),
        api_iterator($cmp.items, function (item) {
          return api_static_fragment($fragment1, api_key(1, item.id));
        }),
      ])
    : stc0;
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
