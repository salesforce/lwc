import { registerTemplate } from "lwc";
const stc0 = {
  attrs: {
    hidden: "",
  },
  key: 0,
};
const stc1 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element } = $api;
  return [
    api_element("p", stc0, [api_text("x")]),
    api_element(
      "input",
      {
        attrs: {
          readonly: $cmp.getReadOnly ? "" : null,
          disabled: "",
          title: "foo",
        },
        key: 1,
      },
      stc1
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
