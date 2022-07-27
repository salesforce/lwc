import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
const stc2 = {
  key: 2,
};
const stc3 = {
  key: 4,
};
const stc4 = {
  key: 5,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element, i: api_iterator, fr: api_fragment } = $api;
  return [
    api_element("table", stc0, [
      api_element("thead", stc1, [
        api_fragment(
          3,
          api_iterator($cmp.rows, function (row) {
            return api_element(
              "tr",
              {
                key: row.id,
              },
              [api_element("th", stc2)]
            );
          })
        ),
      ]),
      api_element("tbody", stc3, [
        api_fragment(
          6,
          api_iterator($cmp.rows, function (row) {
            return api_element(
              "tr",
              {
                key: row.id,
              },
              [api_element("td", stc4)]
            );
          })
        ),
      ]),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
