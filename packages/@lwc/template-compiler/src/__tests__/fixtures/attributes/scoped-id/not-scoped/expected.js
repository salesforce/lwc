import _lightningCombobox from "lightning/combobox";
import { registerTemplate } from "lwc";
const stc0 = {
  props: {
    ariaDescribedBy: "not-scoped-foo",
    ariaActiveDescendant: "not-scoped-foo",
    ariaErrorMessage: "not-scoped-foo",
    ariaFlowTo: "not-scoped-foo",
    ariaLabelledBy: "not-scoped-foo",
  },
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element } = $api;
  return [api_custom_element("lightning-combobox", _lightningCombobox, stc0)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
