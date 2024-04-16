import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<button${3}>New</button>`;
const $fragment2 = parseFragment`<li${3}>${"t1"}<button${3}>[X]</button></li>`;
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
    i: api_iterator,
    h: api_element,
  } = $api;
  const { _m0, _m1 } = $ctx;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(
        0,
        {
          on: {
            click: _m1 || ($ctx._m1 = api_bind($cmp.create)),
          },
        },
        null
      ),
    ]),
    api_element(
      "ul",
      stc0,
      api_iterator($cmp.list, function (task) {
        return api_static_fragment($fragment2, api_key(4, task.id), [
          api_static_part(1, null, api_dynamic_text(task.title)),
          api_static_part(
            2,
            {
              on: {
                click: api_bind(task.delete),
              },
            },
            null
          ),
        ]);
      })
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
