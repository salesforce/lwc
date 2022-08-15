import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<th${3}></th>`;
const $fragment2 = parseFragment`<td${3}></td>`;
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
const stc2 = {
  key: 5,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    k: api_key,
    st: api_static_fragment,
    h: api_element,
    i: api_iterator,
  } = $api;
  return [
    api_element("table", stc0, [
      api_element(
        "thead",
        stc1,
        api_iterator($cmp.rows, function (row) {
          return api_element(
            "tr",
            {
              key: api_key(2, row.id),
            },
            [api_static_fragment($fragment1(), 4)]
          );
        })
      ),
      api_element(
        "tbody",
        stc2,
        api_iterator($cmp.rows, function (row) {
          return api_element(
            "tr",
            {
              key: api_key(6, row.id),
            },
            [api_static_fragment($fragment2(), 8)]
          );
        })
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
