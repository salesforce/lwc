import { registerTemplate, renderApi } from "lwc";
const {
  t: api_text,
  i: api_iterator,
  h: api_element,
  f: api_flatten,
  k: api_key,
} = renderApi;
const $hoisted1 = api_element(
  "p",
  {
    key: 1,
  },
  [api_text("Last child")],
  true
);
const $hoisted2 = api_element(
  "p",
  {
    key: 6,
  },
  [api_text("Last child")],
  true
);
const $hoisted3 = api_element(
  "section",
  {
    classMap: {
      s4: true,
    },
    key: 8,
  },
  [
    api_element(
      "p",
      {
        key: 9,
      },
      [api_text("Other child1")]
    ),
    api_element(
      "p",
      {
        key: 10,
      },
      [api_text("Other child2")]
    ),
  ],
  true
);
const stc0 = {
  classMap: {
    s1: true,
  },
  key: 0,
};
const stc1 = {
  classMap: {
    s2: true,
  },
  key: 2,
};
const stc2 = [];
const stc3 = {
  classMap: {
    s3: true,
  },
  key: 5,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  return [
    api_element(
      "section",
      stc0,
      api_flatten([
        api_text("Other Child"),
        api_iterator($cmp.items, function (item) {
          return api_text("X");
        }),
        $hoisted1,
      ])
    ),
    api_element(
      "section",
      stc1,
      api_flatten([
        api_text("Other Child"),
        $cmp.isTrue
          ? api_iterator($cmp.items, function (item) {
              return [
                api_element(
                  "p",
                  {
                    key: api_key(3, item.id),
                  },
                  [api_text("X1")]
                ),
                api_element(
                  "p",
                  {
                    key: api_key(4, item.id),
                  },
                  [api_text("X2")]
                ),
              ];
            })
          : stc2,
      ])
    ),
    api_element(
      "section",
      stc3,
      api_flatten([
        $hoisted2,
        api_iterator($cmp.items, function (item) {
          return api_element("div", {
            key: api_key(7, item.id),
          });
        }),
      ])
    ),
    $hoisted3,
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
