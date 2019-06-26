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
        key: 1
      },
      api_flatten([
        api_text("Other Child"),
        api_iterator($cmp.items, function(item) {
          return api_text("X");
        }),
        api_element(
          "p",
          {
            key: 0
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
        key: 4
      },
      api_flatten([
        api_text("Other Child"),
        $cmp.isTrue
          ? api_iterator($cmp.items, function(item) {
              return [
                api_element(
                  "p",
                  {
                    key: api_key(2, item.id)
                  },
                  [api_text("X1")]
                ),
                api_element(
                  "p",
                  {
                    key: api_key(3, item.id)
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
        key: 7
      },
      api_flatten([
        api_element(
          "p",
          {
            key: 5
          },
          [api_text("Last child")]
        ),
        api_iterator($cmp.items, function(item) {
          return api_element(
            "div",
            {
              key: api_key(6, item.id)
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
        key: 10
      },
      [
        api_element(
          "p",
          {
            key: 8
          },
          [api_text("Other child1")]
        ),
        api_element(
          "p",
          {
            key: 9
          },
          [api_text("Other child2")]
        )
      ]
    )
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
