import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}>Conditional Iteration</div>`;
const $fragment2 = parseFragment`<div${3}>Else</div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    k: api_key,
    st: api_static_fragment,
    fr: api_fragment,
    i: api_iterator,
  } = $api;
  return api_iterator($cmp.items, function (item) {
    return item.visible
      ? api_fragment(
          0,
          [api_static_fragment($fragment1, api_key(2, item.key))],
          0
        )
      : api_fragment(
          0,
          [api_static_fragment($fragment2, api_key(4, item.key))],
          0
        );
  });
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
