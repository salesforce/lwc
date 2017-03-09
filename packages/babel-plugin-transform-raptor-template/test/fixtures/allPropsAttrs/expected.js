import _nsBuzz from "ns:buzz";
import _nsBar from "ns:bar";
import _nsFoo from "ns:foo";
const memoized = Symbol();
export default function ($api, $cmp, $slotset) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.c(
        "ns-foo",
        _nsFoo,
        {
            props: {
                d: "foo"
            }
        }
    ), $api.h(
        "a",
        {
            props: {
                className: "test",
                href: "/foo",
                title: "test",
                tabIndex: "test"
            },
            attrs: {
                "data-foo": "datafoo",
                "aria-hidden": "h",
                role: "presentation"
            }
        },
        []
    ), $api.c(
        "ns-bar",
        _nsBar,
        {
            props: {
                className: "r",
                fooBar: "x",
                foo: "bar",
                tabIndex: "bar",
                bgcolor: "blue"
            },
            attrs: {
                "data-bar": "test",
                "aria-hidden": "hidden",
                role: "xx"
            }
        }
    ), $api.h(
        "table",
        {
            props: {
                bgColor: "blue"
            }
        },
        []
    ), $api.h(
        "svg",
        {
            props: {
                className: "test"
            }
        },
        [$api.h(
            "use",
            {
                attrs: {
                    "xlink:href": "xx"
                }
            },
            []
        )]
    ), $api.c(
        "div",
        _nsBuzz,
        {
            attrs: {
                is: "ns-buzz",
                "aria-hidden": "hidden"
            },
            props: {
                foo: "bar"
            }
        }
    )];
}
export const templateUsedIds = [];
