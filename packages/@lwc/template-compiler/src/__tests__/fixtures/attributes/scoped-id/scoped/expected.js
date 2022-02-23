import _lightningCombobox from "lightning/combobox";
import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { gid: api_scoped_id, c: api_custom_element } = $api;
  return [
    api_custom_element("lightning-combobox", _lightningCombobox, {
      props: {
        ariaDescribedBy: api_scoped_id("scoped-foo"),
        ariaActiveDescendant: api_scoped_id("scoped-foo"),
        ariaErrorMessage: api_scoped_id("scoped-foo"),
        ariaFlowTo: api_scoped_id("scoped-foo"),
        ariaLabelledBy: api_scoped_id("scoped-foo"),
        ariaControls: api_scoped_id("scoped-foo"),
        ariaDetails: api_scoped_id("scoped-foo"),
        ariaOwns: api_scoped_id("scoped-foo"),
        htmlFor: api_scoped_id("scoped-foo"),
      },
      key: 0,
    }),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
