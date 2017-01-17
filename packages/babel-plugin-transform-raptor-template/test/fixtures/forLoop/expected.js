const memoized = Symbol();
export default function ($api, $cmp) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return $api.h(
        "section",
        {},
        $api.f([$api.i($cmp.items, function (item, index) {
            return $api.h(
                "div",
                {
                    class: "my-list"
                },
                [$api.h(
                    "p",
                    {},
                    ["items"]
                )]
            );
        })])
    );
}
export const templateUsedIds = ["items"];
