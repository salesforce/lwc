import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}>Default fallback</div>`;
const $fragment2 = parseFragment`<div${3}>Named fallback</div>`;
const stc0 = {
  key: 0,
};
const stc1 = {
  attrs: {
    name: "foo",
  },
  key: 3,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    k: api_key,
    st: api_static_fragment,
    i: api_iterator,
    s: api_slot,
  } = $api;
  return [
    api_slot(
      "",
      stc0,
      api_iterator($cmp.defaultItems, function (item) {
        return api_static_fragment($fragment1, api_key(2, item));
      }),
      $slotset
    ),
    api_slot(
      "foo",
      stc1,
      api_iterator($cmp.fooItems, function (item) {
        return api_static_fragment($fragment2, api_key(5, item));
      }),
      $slotset
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["", "foo"];
tmpl.stylesheets = [];
