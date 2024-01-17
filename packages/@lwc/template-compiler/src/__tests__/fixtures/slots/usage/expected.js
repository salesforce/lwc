import _nsCmp from "ns/cmp";
import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p${3}>Default Slot No Slot Attribute</p>`;
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
const stc2 = {
  slotAssignment: "",
  key: 4,
};
const stc3 = {
  slotAssignment: "true",
  key: 5,
};
const stc4 = {
  slotAssignment: "header",
  key: 8,
};
const stc5 = {
  slotAssignment: "",
  key: 9,
};
const stc6 = {
  slotAssignment: "undefined",
  key: 10,
};
const stc7 = {
  slotAssignment: "null",
  key: 11,
};
const stc8 = {
  slotAssignment: "",
  key: 12,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    st: api_static_fragment,
    t: api_text,
    h: api_element,
    c: api_custom_element,
  } = $api;
  return [
    api_element("section", stc0, [
      api_custom_element("ns-cmp", _nsCmp, stc1, [
        api_static_fragment($fragment1(), 3),
        api_element("p", stc2, [api_text("Slot Empty String Attribute")]),
        api_element("p", stc3, [api_text("Slot Boolean Attribute")]),
        api_element(
          "p",
          {
            slotAssignment: $cmp.slot.name,
            key: 6,
          },
          [api_text("Dynamic Slot Content")]
        ),
        api_element(
          "p",
          {
            slotAssignment: $cmp.slotVariable,
            key: 7,
          },
          [api_text("Variable As Slot Assignment")]
        ),
        api_element("p", stc4, [api_text("Header Slot Content")]),
        api_element("p", stc5, [api_text("Default Content")]),
        api_element("p", stc6, [api_text("Undefined Slot Content")]),
        api_element("p", stc7, [api_text("Null Slot Content")]),
        api_element("p", stc8, [api_text("Empty slot value")]),
      ]),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
