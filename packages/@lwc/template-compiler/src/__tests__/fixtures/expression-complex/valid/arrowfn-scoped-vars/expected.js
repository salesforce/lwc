import _xPert from "x/pert";
import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element } = $api;
  return [
    api_custom_element("x-pert", _xPert, {
      props: {
        foo: [
          $cmp.foo,
          (foo) => foo,
          $cmp.foo,
          [(foo) => [foo, (foo) => foo, foo], $cmp.foo],
        ],
      },
      key: 0,
    }),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
