import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p${3}>items</p>`;
const stc0 = {
  key: 0,
};
const stc1 = {
  "my-list": true,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    st: api_static_fragment,
    h: api_element,
    i: api_iterator,
    fr: api_fragment,
  } = $api;
  return [
    api_element("section", stc0, [
      api_fragment(
        3,
        api_iterator($cmp.items, function (item) {
          return api_element(
            "div",
            {
              classMap: stc1,
              key: item.id,
            },
            [api_static_fragment($fragment1(), 2)]
          );
        })
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
