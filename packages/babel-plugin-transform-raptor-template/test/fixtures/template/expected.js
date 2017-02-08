const memoized = Symbol();
export default function ($api, $cmp) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.h(
        "p",
        {},
        ["Root"]
    )];
}
export const templateUsedIds = [];
