import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    t: api_text,
    i: api_iterator,
    h: api_element,
    f: api_flatten,
    k: api_key
  } = $api;

  return [
    api_element(
      "section",
      {
        classMap: {
          s1: true
        },
        key: 2,
        update: () => {}
      },
      api_flatten([
        api_text("Other Child"),
        api_iterator($cmp.items, function(item) {
          return api_text("X");
        }),
        api_element(
          "p",
          {
            key: 4,
            create: () => {},
            update: () => {}
          },
          [api_text("Last child")]
        )
      ])
    ),
    api_element(
      "section",
      {
        classMap: {
          s2: true
        },
        key: 5,
        update: () => {}
      },
      api_flatten([
        api_text("Other Child"),
        $cmp.isTrue
          ? api_iterator($cmp.items, function(item) {
              return [
                api_element(
                  "p",
                  {
                    key: api_key(8, item.id),
                    create: () => {},
                    update: () => {}
                  },
                  [api_text("X1")]
                ),
                api_element(
                  "p",
                  {
                    key: api_key(9, item.id),
                    create: () => {},
                    update: () => {}
                  },
                  [api_text("X2")]
                )
              ];
            })
          : []
      ])
    ),
    api_element(
      "section",
      {
        classMap: {
          s3: true
        },
        key: 10,
        update: () => {}
      },
      api_flatten([
        api_element(
          "p",
          {
            key: 11,
            create: () => {},
            update: () => {}
          },
          [api_text("Last child")]
        ),
        api_iterator($cmp.items, function(item) {
          return api_element(
            "div",
            {
              key: api_key(12, item.id),
              create: () => {},
              update: () => {}
            },
            []
          );
        })
      ])
    ),
    api_element(
      "section",
      {
        classMap: {
          s4: true
        },
        key: 13,
        update: () => {}
      },
      [
        api_element(
          "p",
          {
            key: 14,
            create: () => {},
            update: () => {}
          },
          [api_text("Other child1")]
        ),
        api_element(
          "p",
          {
            key: 15,
            create: () => {},
            update: () => {}
          },
          [api_text("Other child2")]
        )
      ]
    )
  ];
}

export default registerTemplate(tmpl);
