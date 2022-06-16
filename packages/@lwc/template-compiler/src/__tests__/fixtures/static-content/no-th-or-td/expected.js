import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
const stc2 = {
  key: 3,
};
const stc3 = {
  key: 4,
};
const stc4 = {
  key: 6,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { k: api_key, h: api_element, i: api_iterator } = $api;
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
            [api_element("th", stc2)]
          );
        })
      ),
      api_element(
        "tbody",
        stc3,
        api_iterator($cmp.rows, function (row) {
          return api_element(
            "tr",
            {
              key: api_key(5, row.id),
            },
            [api_element("td", stc4)]
          );
        })
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
