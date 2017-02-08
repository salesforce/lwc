const memoized = Symbol();
export default function ($api, $cmp) {
  const m = $cmp[memoized] || ($cmp[memoized] = {});
  return [$api.h(
    "section",
    {},
    [$api.h(
      "p",
      {
        dataset: {
          "BarBaz": "xyz"
        }
      },
      []
    )]
  )];
}
export const templateUsedIds = [];
