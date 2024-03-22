import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<span${"a0:data-dynamic"}${3}></span>`;
const $fragment2 = parseFragment`<span data-static="bar"${3}></span>`;
const $fragment3 = parseFragment`<span${"s0"}${3}></span>`;
const $fragment4 = parseFragment`<span style="quux"${3}></span>`;
const $fragment5 = parseFragment`<span${"a0:data-dynamic"}${"s0"}${"c0"}${2}></span>`;
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    k: api_key,
    sp: api_static_part,
    st: api_static_fragment,
    h: api_element,
    i: api_iterator,
  } = $api;
  return [
    api_element(
      "div",
      stc0,
      api_iterator($cmp.items, function (item) {
        return api_element(
          "div",
          {
            key: api_key(1, item.key),
          },
          [
            api_static_fragment($fragment1, 3, [
              api_static_part(0, {
                attrs: {
                  "data-dynamic": $cmp.foo,
                },
              }),
            ]),
            api_static_fragment($fragment2, 5),
            api_static_fragment($fragment3, 7, [
              api_static_part(0, {
                style: $cmp.baaz,
              }),
            ]),
            api_static_fragment($fragment4, 9),
            api_static_fragment($fragment5, 11, [
              api_static_part(0, {
                style: $cmp.baaz,
                className: $cmp.bar,
                attrs: {
                  "data-dynamic": $cmp.foo,
                },
              }),
            ]),
          ]
        );
      })
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
