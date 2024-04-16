import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}><span${"a1:data-dynamic"}${3}></span><span data-static="bar"${3}></span><span${"s3"}${3}></span><span style="quux"${3}></span><span${3}>${"t6"}</span><span${"a7:data-dynamic"}${"s7"}${"c7"}${2}>${"t8"}</span></div>`;
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    k: api_key,
    d: api_dynamic_text,
    sp: api_static_part,
    st: api_static_fragment,
    i: api_iterator,
    h: api_element,
  } = $api;
  return [
    api_element(
      "div",
      stc0,
      api_iterator($cmp.items, function (item) {
        return api_static_fragment($fragment1, api_key(2, item.key), [
          api_static_part(
            1,
            {
              attrs: {
                "data-dynamic": $cmp.foo,
              },
            },
            null
          ),
          api_static_part(
            3,
            {
              style: $cmp.baaz,
            },
            null
          ),
          api_static_part(
            6,
            null,
            "concatenated text " + api_dynamic_text(item.text)
          ),
          api_static_part(
            7,
            {
              style: $cmp.baaz,
              className: $cmp.bar,
              attrs: {
                "data-dynamic": $cmp.foo,
              },
            },
            null
          ),
          api_static_part(8, null, api_dynamic_text(item.text)),
        ]);
      })
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
