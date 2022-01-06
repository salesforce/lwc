import _xFoo from "x/foo";
import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { gid: api_scoped_id, c: api_custom_element } = $api;
  return [
    api_custom_element(
      "x-foo",
      _xFoo,
      {
        props: {
          accessKey: "tranformed",
          readOnly: "tranformed",
          tabIndex: "0",
          bgColor: "tranformed",
          colSpan: "tranformed",
          rowSpan: "tranformed",
          contentEditable: "tranformed",
          crossOrigin: "tranformed",
          dateTime: "tranformed",
          formAction: "tranformed",
          isMap: "tranformed",
          maxLength: "tranformed",
          minLength: "tranformed",
          noValidate: "tranformed",
          useMap: "tranformed",
          htmlFor: api_scoped_id("tranformed"),
          ariaActiveDescendant: api_scoped_id("tranformed"),
          ariaAtomic: "tranformed",
          ariaAutoComplete: "tranformed",
          ariaBusy: "tranformed",
          ariaChecked: "tranformed",
          ariaColCount: "tranformed",
          ariaColIndex: "tranformed",
          ariaColSpan: "tranformed",
          ariaControls: api_scoped_id("tranformed"),
          ariaCurrent: "tranformed",
          ariaDescribedBy: api_scoped_id("tranformed"),
          ariaDetails: api_scoped_id("tranformed"),
          ariaDisabled: "tranformed",
          ariaErrorMessage: api_scoped_id("tranformed"),
          ariaExpanded: "tranformed",
          ariaFlowTo: api_scoped_id("tranformed"),
          ariaHasPopup: "tranformed",
          ariaHidden: "tranformed",
          ariaInvalid: "tranformed",
          ariaKeyShortcuts: "tranformed",
          ariaLabel: "tranformed",
          ariaLabelledBy: api_scoped_id("tranformed"),
          ariaLevel: "tranformed",
          ariaLive: "tranformed",
          ariaModal: "tranformed",
          ariaMultiLine: "tranformed",
          ariaMultiSelectable: "tranformed",
          ariaOrientation: "tranformed",
          ariaOwns: api_scoped_id("tranformed"),
          ariaPlaceholder: "tranformed",
          ariaPosInSet: "tranformed",
          ariaPressed: "tranformed",
          ariaReadOnly: "tranformed",
          ariaRelevant: "tranformed",
          ariaRequired: "tranformed",
          ariaRoleDescription: "tranformed",
          ariaRowCount: "tranformed",
          ariaRowIndex: "tranformed",
          ariaRowSpan: "tranformed",
          ariaSelected: "tranformed",
          ariaSetSize: "tranformed",
          ariaSort: "tranformed",
          ariaValueMax: "tranformed",
          ariaValueMin: "tranformed",
          ariaValueNow: "tranformed",
          ariaValueText: "tranformed",
          role: "tranformed",
        },
        key: 0,
      },
      []
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
