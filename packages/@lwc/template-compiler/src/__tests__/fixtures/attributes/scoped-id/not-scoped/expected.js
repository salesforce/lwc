import _lightningCombobox from "lightning/combobox";
import { registerTemplate, renderApi } from "lwc";
const { c: api_custom_element } = renderApi;
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
  return [api_custom_element("lightning-combobox", _lightningCombobox, stc0)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
