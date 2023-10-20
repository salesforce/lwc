import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<button${3}>New</button>`;
const $fragment2 = parseFragment`<button${3}>[X]</button>`;
const stc0 = {
  key: 2,
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
  const { _m0, _m1 } = $ctx;
  return [
    api_static_fragment($fragment1(), 1, [
      api_static_part(0, {
        on: {
          click: _m1 || ($ctx._m1 = api_bind($cmp.create)),
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
            key: api_key(3, task.id),
          },
          [
            api_text(api_dynamic_text(task.title)),
            api_static_fragment($fragment2(), 5, [
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
