import _lightningCombobox from "lightning/combobox";
import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { gid: api_scoped_id, c: api_custom_element } = $api;
  return [
    api_custom_element("lightning-combobox", _lightningCombobox, {
      props: {
        ariaDescribedby: api_scoped_id("scoped-foo"),
        ariaActivedescendant: api_scoped_id("scoped-foo"),
        ariaErrormessage: api_scoped_id("scoped-foo"),
        ariaFlowto: api_scoped_id("scoped-foo"),
        ariaLabelledby: api_scoped_id("scoped-foo"),
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
