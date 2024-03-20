import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<h1${3}>Happy days!</h1>`;
const $fragment2 = parseFragment`<h1${"a0:data-dynamic"}${3}>Dynamic attribute</h1>`;
const $fragment3 = parseFragment`<h1${"s0"}${3}>Dynamic style</h1>`;
const $fragment4 = parseFragment`<h1${3}>stranger</h1>`;
const $fragment5 = parseFragment`<h1${3}>things</h1>`;
const $fragment6 = parseFragment`<h1${"a0:data-dynamic"}${3}>Dynamic attribute</h1>`;
const $fragment7 = parseFragment`<h1${"s0"}${3}>Dynamic style</h1>`;
const $fragment8 = parseFragment`<h1${3}>hello</h1>`;
const $fragment9 = parseFragment`<h1${3}>world!</h1>`;
const $fragment10 = parseFragment`<h1${"a0:data-dynamic"}${3}>Dynamic attribute</h1>`;
const $fragment11 = parseFragment`<h1${"s0"}${3}>Dynamic style</h1>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    t: api_text,
    st: api_static_fragment,
    sp: api_static_part,
    h: api_element,
    fr: api_fragment,
  } = $api;
  return [
    $cmp.visible
      ? api_fragment(
          0,
          [
            api_text("Conditional Text"),
            api_static_fragment($fragment1, 2),
            api_static_fragment($fragment2, 4, [
              api_static_part(0, {
                attrs: {
                  "data-dynamic": $cmp.dynamic,
                },
              }),
            ]),
            api_element(
              "h1",
              {
                className: $cmp.dynamicClass,
                key: 5,
              },
              [api_text("Dynamic class")]
            ),
            api_static_fragment($fragment3, 7, [
              api_static_part(0, {
                style: $cmp.dynamicStyle,
              }),
            ]),
            api_element(
              "h1",
              {
                className: $cmp.dynamicClass,
                style: $cmp.dynamicStyle,
                attrs: {
                  "data-dynamic": $cmp.dynamic,
                },
                key: 8,
              },
              [api_text("Dynamic combination")]
            ),
          ],
          0
        )
      : api_fragment(
          0,
          [
            api_static_fragment($fragment4, 10),
            api_static_fragment($fragment5, 12),
            api_static_fragment($fragment6, 14, [
              api_static_part(0, {
                attrs: {
                  "data-dynamic": $cmp.dynamic,
                },
              }),
            ]),
            api_element(
              "h1",
              {
                className: $cmp.dynamicClass,
                key: 15,
              },
              [api_text("Dynamic class")]
            ),
            api_static_fragment($fragment7, 17, [
              api_static_part(0, {
                style: $cmp.dynamicStyle,
              }),
            ]),
            api_element(
              "h1",
              {
                className: $cmp.dynamicClass,
                style: $cmp.dynamicStyle,
                attrs: {
                  "data-dynamic": $cmp.dynamic,
                },
                key: 18,
              },
              [api_text("Dynamic combination")]
            ),
          ],
          0
        ),
    api_static_fragment($fragment8, 20),
    api_static_fragment($fragment9, 22),
    api_static_fragment($fragment10, 24, [
      api_static_part(0, {
        attrs: {
          "data-dynamic": $cmp.dynamic,
        },
      }),
    ]),
    api_element(
      "h1",
      {
        className: $cmp.dynamicClass,
        key: 25,
      },
      [api_text("Dynamic class")]
    ),
    api_static_fragment($fragment11, 27, [
      api_static_part(0, {
        style: $cmp.dynamicStyle,
      }),
    ]),
    api_element(
      "h1",
      {
        className: $cmp.dynamicClass,
        style: $cmp.dynamicStyle,
        attrs: {
          "data-dynamic": $cmp.dynamic,
        },
        key: 28,
      },
      [api_text("Dynamic combination")]
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
