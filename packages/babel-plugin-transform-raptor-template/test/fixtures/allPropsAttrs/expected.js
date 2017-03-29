import _nsTable from "ns-table";
import _nsBuzz from "ns-buzz";
import _nsBar from "ns-bar";
import _nsFoo from "ns-foo";

const _m = function ($api, $cmp) {
    return $cmp.p.foo;
};

export default function tmpl($api, $cmp, $slotset, $ctx) {
    const m = $ctx.memoized || ($ctx.memoized = {});
    return [$api.c(
        "ns-foo",
        _nsFoo,
        {
            props: {
                d: m._m || (m._m = _m($api, $cmp))
            }
        }
    ), $api.h(
        "a",
        {
            classMap: {
                test: true
            },
            attrs: {
                "data-foo": "datafoo",
                "aria-hidden": "h",
                role: "presentation",
                href: "/foo",
                title: "test",
                tabindex: "test"
            }
        },
        []
    ), $api.c(
        "ns-bar",
        _nsBar,
        {
            classMap: {
                r: true
            },
            attrs: {
                "data-xx": "foo",
                "aria-hidden": "hidden",
                role: "xx",
                tabindex: "bar"
            },
            props: {
                fooBar: "x",
                foo: "bar",
                bgcolor: "blue"
            }
        }
    ), $api.h(
        "svg",
        {
            classMap: {
                cubano: true
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
                bgcolor: "x"
            }
        }
    ), $api.h(
        "table",
        {
            attrs: {
                bgcolor: "x"
            }
        },
        []
    ), $api.c(
        "table",
        _nsTable,
        {
            attrs: {
                bgcolor: "x",
                is: "ns-table",
                tabindex: "2"
            },
            props: {
                bar: "test",
                min: "3"
            }
        }
    ), $api.h(
        "div",
        {
            className: $cmp.foo,
            attrs: {
                "aria-hidden": "hidden"
            }
        },
        []
    )];
}
tmpl.ids = ["foo"];
