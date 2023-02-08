import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p${3}>items</p>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    k: api_key,
    st: api_static_fragment,
    dc: api_dynamic_component,
    i: api_iterator,
  } = $api;
  return api_iterator($cmp.items, function (item) {
    return api_dynamic_component(
      $cmp.ctor,
      {
        key: api_key(0, item.id),
      },
      [api_static_fragment($fragment1(), 2)]
    );
  });
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
