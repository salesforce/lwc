import { registerTemplate, renderApi } from "lwc";
const {
  t: api_text,
  so: api_set_owner,
  i: api_iterator,
  h: api_element,
  f: api_flatten,
  k: api_key,
} = renderApi;
const $hoisted1 = api_text("Other Child");
const $hoisted2 = api_text("X");
const $hoisted3 = api_element(
  "p",
  {
    key: 1,
    isStatic: true,
  },
  [api_text("Last child")]
);
const $hoisted4 = api_text("Other Child");
const $hoisted5 = api_text("X1");
const $hoisted6 = api_text("X2");
const $hoisted7 = api_element(
  "p",
  {
    key: 6,
    isStatic: true,
  },
  [api_text("Last child")]
);
const $hoisted8 = api_element(
  "section",
  {
    classMap: {
      s4: true,
    },
    key: 8,
    isStatic: true,
  },
  [
    api_element(
      "p",
      {
        key: 9,
        isStatic: true,
      },
      [api_text("Other child1")]
    ),
    api_element(
      "p",
      {
        key: 10,
        isStatic: true,
      },
      [api_text("Other child2")]
    ),
  ]
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
        api_set_owner($hoisted1),
        api_iterator($cmp.items, function (item) {
          return api_set_owner($hoisted2);
        }),
        api_set_owner($hoisted3),
      ])
    ),
    api_element(
      "section",
      stc1,
      api_flatten([
        api_set_owner($hoisted4),
        $cmp.isTrue
          ? api_iterator($cmp.items, function (item) {
              return [
                api_element(
                  "p",
                  {
                    key: api_key(3, item.id),
                  },
                  [api_set_owner($hoisted5)]
                ),
                api_element(
                  "p",
                  {
                    key: api_key(4, item.id),
                  },
                  [api_set_owner($hoisted6)]
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
        api_set_owner($hoisted7),
        api_iterator($cmp.items, function (item) {
          return api_element("div", {
            key: api_key(7, item.id),
          });
        }),
      ])
    ),
    api_set_owner($hoisted8),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
