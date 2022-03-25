import { registerTemplate, renderApi } from "lwc";
const {
  b: api_bind,
  t: api_text,
  so: api_set_owner,
  h: api_element,
  k: api_key,
  d: api_dynamic_text,
  i: api_iterator,
} = renderApi;
const $hoisted1 = api_text("New", true);
const $hoisted2 = api_text("[X]", true);
const stc0 = {
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { _m0 } = $ctx;
  return [
    api_element(
      "button",
      {
        key: 0,
        on: {
          click: _m0 || ($ctx._m0 = api_bind($cmp.create)),
        },
      },
      [api_set_owner($hoisted1)]
    ),
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
            api_element(
              "button",
              {
                key: 3,
                on: {
                  click: api_bind(task.delete),
                },
              },
              [api_set_owner($hoisted2)]
            ),
          ]
        );
      })
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
