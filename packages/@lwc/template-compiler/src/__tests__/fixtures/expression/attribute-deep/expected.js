import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element("section", stc0, [
      api_element(
        "p",
        {
          className: $cmp.bar.foo.baz,
          key: 1,
        },
        stc1
      ),
    ]),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
