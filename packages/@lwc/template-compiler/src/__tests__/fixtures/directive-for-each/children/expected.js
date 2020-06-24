import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    t: api_text,
    i: api_iterator,
    h: api_element,
    f: api_flatten,
    k: api_key,
  } = $api;
  return [
    api_element(
      "section",
      {
        classMap: {
          s1: true,
        },
        key: 4,
      },
      api_flatten([
        api_text("Other Child", 0),
        api_iterator($cmp.items, function (item) {
          return api_text("X", 1);
        }),
        api_element(
          "p",
          {
            key: 3,
          },
          [api_text("Last child", 2)]
        ),
      ])
    ),
    api_element(
      "section",
      {
        classMap: {
          s2: true,
        },
        key: 10,
      },
      api_flatten([
        api_text("Other Child", 5),
        $cmp.isTrue
          ? api_iterator($cmp.items, function (item) {
              return [
                api_element(
                  "p",
                  {
                    key: api_key(7, item.id),
                  },
                  [api_text("X1", 6)]
                ),
                api_element(
                  "p",
                  {
                    key: api_key(9, item.id),
                  },
                  [api_text("X2", 8)]
                ),
              ];
            })
          : [],
      ])
    ),
    api_element(
      "section",
      {
        classMap: {
          s3: true,
        },
        key: 14,
      },
      api_flatten([
        api_element(
          "p",
          {
            key: 12,
          },
          [api_text("Last child", 11)]
        ),
        api_iterator($cmp.items, function (item) {
          return api_element(
            "div",
            {
              key: api_key(13, item.id),
            },
            []
          );
        }),
      ])
    ),
    api_element(
      "section",
      {
        classMap: {
          s4: true,
        },
        key: 19,
      },
      [
        api_element(
          "p",
          {
            key: 16,
          },
          [api_text("Other child1", 15)]
        ),
        api_element(
          "p",
          {
            key: 18,
          },
          [api_text("Other child2", 17)]
        ),
      ]
    ),
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
