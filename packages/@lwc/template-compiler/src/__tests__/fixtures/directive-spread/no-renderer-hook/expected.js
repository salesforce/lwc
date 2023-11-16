import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { ddc: api_deprecated_dynamic_component, dc: api_dynamic_component } =
    $api;
  return [
    api_deprecated_dynamic_component("x-foo", $cmp.dynamicCtor, {
      props: {
        ...$cmp.dynamicProps,
      },
      key: 0,
    }),
    api_dynamic_component($cmp.dynamicCtor, {
      props: {
        ...$cmp.dynamicProps,
      },
      key: 1,
    }),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
