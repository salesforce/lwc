import _lightningCombobox from "lightning/combobox";
import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element } = $api;
  return [
    api_custom_element(
      "lightning-combobox",
      _lightningCombobox,
      {
        props: {
          ariaDescribedBy: "not-scoped-foo",
          ariaActiveDescendant: "not-scoped-foo",
          ariaErrorMessage: "not-scoped-foo",
          ariaFlowTo: "not-scoped-foo",
          ariaLabelledBy: "not-scoped-foo",
        },
        key: 0,
      },
      []
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
