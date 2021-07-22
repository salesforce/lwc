import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  function foreach1_0(task) {
    return api_element(
      "li",
      {
        key: api_key(2, task.id),
      },
      [
        api_dynamic(task.title),
        api_element(
          "button",
          {
            key: 3,
            on: {
              click: api_bind(task.delete),
            },
          },
          [api_text("[X]")]
        ),
      ]
    );
  }
  const {
    b: api_bind,
    t: api_text,
    h: api_element,
    k: api_key,
    d: api_dynamic,
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
      [api_text("New")]
    ),
    api_element(
      "ul",
      {
        key: 1,
      },
      api_iterator($cmp.list, foreach1_0)
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
