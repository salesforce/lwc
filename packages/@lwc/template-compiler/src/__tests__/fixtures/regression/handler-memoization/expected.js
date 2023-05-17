import { registerTemplate } from "lwc";
const stc0 = ["New"];
const stc1 = {
  key: 1,
};
const stc2 = ["[X]"];
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    b: api_bind,
    h: api_element,
    k: api_key,
    d: api_dynamic_text,
    t: api_text,
    i: api_iterator,
  } = $api;
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
      stc0,
      384
    ),
    api_element(
      "ul",
      stc1,
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
              stc2,
              384
            ),
          ],
          0
        );
      }),
      0
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
