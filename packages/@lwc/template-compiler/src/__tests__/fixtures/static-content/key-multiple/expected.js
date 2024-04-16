import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}><span${3}>repeated item #1</span></div>`;
const $fragment2 = parseFragment`<div${3}><span${3}>repeated item #2</span></div>`;
const $fragment3 = parseFragment`<div${3}><span${3}>repeated item #3</span></div>`;
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
      "div",
      stc0,
      api_iterator($cmp.rows, function (row) {
        return [
          api_static_fragment($fragment1, api_key(2, row.id)),
          api_static_fragment($fragment2, api_key(4, row.id)),
          api_static_fragment($fragment3, api_key(6, row.id)),
        ];
      })
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
