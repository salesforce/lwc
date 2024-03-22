import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div class="my-list${0}"${2}><p${3}>items</p></div>`;
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    k: api_key,
    st: api_static_fragment,
    i: api_iterator,
    h: api_element,
  } = $api;
  return [
    api_element(
      "section",
      stc0,
      api_iterator($cmp.items, function (item) {
        return api_static_fragment($fragment1, api_key(2, item.id));
      })
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
