import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { dc: api_dynamic_component } = $api;
  return [
    api_dynamic_component($cmp.ctor, {
      props: {
        ...$cmp.hello,
      },
      key: 0,
    }),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
