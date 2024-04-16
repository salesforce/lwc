import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<h1${3}>Happy days!</h1>`;
const $fragment2 = parseFragment`<h1${"a0:data-dynamic"}${3}>Dynamic attribute</h1>`;
const $fragment3 = parseFragment`<h1${"c0"}${2}>Dynamic class</h1>`;
const $fragment4 = parseFragment`<h1${"s0"}${3}>Dynamic style</h1>`;
const $fragment5 = parseFragment`<h1${"a0:data-dynamic"}${"c0"}${"s0"}${2}>Dynamic combination</h1>`;
const $fragment6 = parseFragment`<h1${3}>stranger</h1>`;
const $fragment7 = parseFragment`<h1${3}>things</h1>`;
const $fragment8 = parseFragment`<h1${"a0:data-dynamic"}${3}>Dynamic attribute</h1>`;
const $fragment9 = parseFragment`<h1${"c0"}${2}>Dynamic class</h1>`;
const $fragment10 = parseFragment`<h1${"s0"}${3}>Dynamic style</h1>`;
const $fragment11 = parseFragment`<h1${"a0:data-dynamic"}${"c0"}${"s0"}${2}>Dynamic combination</h1>`;
const $fragment12 = parseFragment`<h1${3}>hello</h1>`;
const $fragment13 = parseFragment`<h1${3}>world!</h1>`;
const $fragment14 = parseFragment`<h1${"a0:data-dynamic"}${3}>Dynamic attribute</h1>`;
const $fragment15 = parseFragment`<h1${"c0"}${2}>Dynamic class</h1>`;
const $fragment16 = parseFragment`<h1${"s0"}${3}>Dynamic style</h1>`;
const $fragment17 = parseFragment`<h1${"a0:data-dynamic"}${"c0"}${"s0"}${2}>Dynamic combination</h1>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    t: api_text,
    st: api_static_fragment,
    sp: api_static_part,
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
              api_static_part(
                0,
                {
                  attrs: {
                    "data-dynamic": $cmp.dynamic,
                  },
                },
                null
              ),
            ]),
            api_static_fragment($fragment3, 6, [
              api_static_part(
                0,
                {
                  className: $cmp.dynamicClass,
                },
                null
              ),
            ]),
            api_static_fragment($fragment4, 8, [
              api_static_part(
                0,
                {
                  style: $cmp.dynamicStyle,
                },
                null
              ),
            ]),
            api_static_fragment($fragment5, 10, [
              api_static_part(
                0,
                {
                  className: $cmp.dynamicClass,
                  style: $cmp.dynamicStyle,
                  attrs: {
                    "data-dynamic": $cmp.dynamic,
                  },
                },
                null
              ),
            ]),
          ],
          0
        )
      : api_fragment(
          0,
          [
            api_static_fragment($fragment6, 12),
            api_static_fragment($fragment7, 14),
            api_static_fragment($fragment8, 16, [
              api_static_part(
                0,
                {
                  attrs: {
                    "data-dynamic": $cmp.dynamic,
                  },
                },
                null
              ),
            ]),
            api_static_fragment($fragment9, 18, [
              api_static_part(
                0,
                {
                  className: $cmp.dynamicClass,
                },
                null
              ),
            ]),
            api_static_fragment($fragment10, 20, [
              api_static_part(
                0,
                {
                  style: $cmp.dynamicStyle,
                },
                null
              ),
            ]),
            api_static_fragment($fragment11, 22, [
              api_static_part(
                0,
                {
                  className: $cmp.dynamicClass,
                  style: $cmp.dynamicStyle,
                  attrs: {
                    "data-dynamic": $cmp.dynamic,
                  },
                },
                null
              ),
            ]),
          ],
          0
        ),
    api_static_fragment($fragment12, 24),
    api_static_fragment($fragment13, 26),
    api_static_fragment($fragment14, 28, [
      api_static_part(
        0,
        {
          attrs: {
            "data-dynamic": $cmp.dynamic,
          },
        },
        null
      ),
    ]),
    api_static_fragment($fragment15, 30, [
      api_static_part(
        0,
        {
          className: $cmp.dynamicClass,
        },
        null
      ),
    ]),
    api_static_fragment($fragment16, 32, [
      api_static_part(
        0,
        {
          style: $cmp.dynamicStyle,
        },
        null
      ),
    ]),
    api_static_fragment($fragment17, 34, [
      api_static_part(
        0,
        {
          className: $cmp.dynamicClass,
          style: $cmp.dynamicStyle,
          attrs: {
            "data-dynamic": $cmp.dynamic,
          },
        },
        null
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
