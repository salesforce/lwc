const _m2 = function ($api, $cmp) {
    return $cmp.handlePress.bind($cmp);
};

const _m = function ($api, $cmp) {
    return $cmp.handleClick.bind($cmp);
};

const memoized = Symbol();
export default function ($api, $cmp, $slotset) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.h(
        "section",
        {},
        [$api.h(
            "div",
            {
                on: {
                    click: m._m || (m._m = _m($api, $cmp))
                }
            },
            ["x"]
        ), $api.h(
            "div",
            {
                on: {
                    press: m._m2 || (m._m2 = _m2($api, $cmp))
                }
            },
            ["x"]
        )]
    )];
}
export const templateUsedIds = [];
