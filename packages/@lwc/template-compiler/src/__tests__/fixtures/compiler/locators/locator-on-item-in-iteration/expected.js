import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic,
    fb: function_bind,
    ll: locator_listener,
    h: api_element,
    k: api_key,
    i: api_iterator
  } = $api;
  const { _m0 } = $ctx;
  return api_iterator($cmp.state.todos, function(todo, index) {
    return api_element(
      "li",
      {
        key: api_key(1, todo.id)
      },
      [
        api_element(
          "button",
          {
            context: {
              locator: {
                id: "todo-item",
                context:
                  _m0 || ($ctx._m0 = function_bind($cmp.locatorProviderTodo))
              }
            },
            key: 0,
            on: {
              click: locator_listener(
                todo.clickHandler,
                "todo-item",
                function_bind($cmp.locatorProviderTodo)
              )
            }
          },
          [api_dynamic(todo.text)]
        )
      ]
    );
  });
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
