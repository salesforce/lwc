import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<button${3}>New</button>`;
const $fragment2 = parseFragment`<button${3}>[X]</button>`;
const stc0 = {
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    b: api_bind,
    sp: api_static_part,
    st: api_static_fragment,
    k: api_key,
    d: api_dynamic_text,
    t: api_text,
    h: api_element,
    i: api_iterator,
  } = $api;
  const { _m0 } = $ctx;
  return [
    api_static_fragment($fragment1, 0, [
      api_static_part(0, {
        on: {
          click: _m0 || ($ctx._m0 = api_bind($cmp.create)),
        },
      }),
    ]),
    api_element(
      "ul",
      stc0,
      api_iterator($cmp.list, function (task) {
        return api_element(
          "li",
          {
            key: api_key(2, task.id),
          },
          [
            api_text(api_dynamic_text(task.title)),
            api_static_fragment($fragment2, 3, [
              api_static_part(0, {
                on: {
                  click: api_bind(task.delete),
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
