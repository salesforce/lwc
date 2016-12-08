import _ns$foo from "ns:foo";
export default function ({
    i,
    f,
    e,
    h,
    v,
    s
}) {
    return h(
        "section",
        {},
        [v(
            _ns$foo,
            {
                props: {
                    d: this.p.foo.bind(this)
                }
            },
            []
        )]
    );
}
export const usedIdentifiers = ["p"];
