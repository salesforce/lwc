import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
const stc2 = {
  attrs: {
    name: "header",
  },
  key: 2,
};
const stc3 = {
  key: 3,
};
const stc4 = {
  key: 4,
};
const stc5 = {
  key: 5,
};
const stc6 = {
  key: "@:6",
};
const stc7 = {
  attrs: {
    name: "footer",
  },
  key: 7,
};
const stc8 = {
  key: "@footer:8",
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element, s: api_slot } = $api;
  return [
    api_element("section", stc0, [
      api_element("p", stc1, [api_text("Before header")]),
      api_slot("header", stc2, [api_text("Default header")], $slotset),
      api_element("p", stc3, [api_text("In")]),
      api_element("p", stc4, [api_text("between")]),
      api_slot(
        "",
        stc5,
        [api_element("p", stc6, [api_text("Default body")])],
        $slotset
      ),
      api_slot(
        "footer",
        stc7,
        [api_element("p", stc8, [api_text("Default footer")])],
        $slotset
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["", "footer", "header"];
