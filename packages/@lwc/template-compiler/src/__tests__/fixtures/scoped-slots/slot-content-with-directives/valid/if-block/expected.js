import _xCounter from "x/counter";
import _xButton1 from "x/button1";
import _xButton2 from "x/button2";
import _xButton3 from "x/button3";
import _xChild from "x/child";
import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 2,
};
const stc2 = {
  key: 3,
};
const stc3 = {
  key: 4,
};
const stc4 = {
  key: 6,
};
const stc5 = {
  key: 7,
};
const stc6 = {
  key: 8,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    t: api_text,
    c: api_custom_element,
    fr: api_fragment,
    ssf: api_scoped_slot_factory,
  } = $api;
  return [
    api_custom_element("x-child", _xChild, stc0, [
      api_scoped_slot_factory("", function (variations, key) {
        return api_fragment(
          key,
          [
            variations.variation1
              ? api_fragment(
                  1,
                  [
                    api_custom_element("x-counter", _xCounter, stc1, [
                      api_text("Counter1"),
                    ]),
                  ],
                  0
                )
              : variations.variation2
              ? api_fragment(
                  1,
                  [api_custom_element("x-counter", _xCounter, stc2)],
                  0
                )
              : variations.variation2
              ? api_fragment(
                  1,
                  [api_custom_element("x-counter", _xCounter, stc3)],
                  0
                )
              : null,
          ],
          0
        );
      }),
      api_scoped_slot_factory("foo", function (variations, key) {
        return api_fragment(
          key,
          [
            variations.variation1
              ? api_fragment(
                  5,
                  [
                    api_custom_element("x-button1", _xButton1, stc4, [
                      api_text("Button 1"),
                    ]),
                  ],
                  0
                )
              : variations.variation2
              ? api_fragment(
                  5,
                  [api_custom_element("x-button2", _xButton2, stc5)],
                  0
                )
              : api_fragment(
                  5,
                  [api_custom_element("x-button3", _xButton3, stc6)],
                  0
                ),
          ],
          0
        );
      }),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
