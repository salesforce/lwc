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
    k: api_key,
    st: api_static_fragment,
    h: api_element,
    i: api_iterator,
  } = $api;
  return [
    api_element(
      "section",
      stc0,
      api_iterator($cmp.items, function (item) {
        return api_element(
          "div",
          {
            classMap: stc1,
            key: api_key(1, item.id),
          },
          [api_static_fragment($fragment1(), 3)]
        );
      })
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
