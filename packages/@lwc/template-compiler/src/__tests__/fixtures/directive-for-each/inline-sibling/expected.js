import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<li${3}>Last</li>`;
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic_text,
    t: api_text,
    h: api_element,
    i: api_iterator,
    fr: api_fragment,
    st: api_static_fragment,
  } = $api;
  return [
    api_element("ul", stc0, [
      api_fragment(
        1,
        api_iterator($cmp.items, function (item) {
          return api_element(
            "li",
            {
              className: item.x,
              key: item.id,
            },
            [api_text(api_dynamic_text(item))]
          );
        })
      ),
      api_static_fragment($fragment1(), 3),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
