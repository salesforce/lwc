import { ns$outerItem as _ns$outerItem } from "ns:outerItem";
import { ns$otherWrapper as _ns$otherWrapper } from "ns:otherWrapper";
import { a$b as _a$b } from "a:b";
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
        f([i(this.items, (item, index) => {
            return v(
                _ns$outerItem,
                {
                    "class": ""
                },
                [h(
                    "div",
                    {
                        "class": "wrapper"
                    },
                    [item.x ? h(
                        "p",
                        {},
                        ["x"]
                    ) : h(
                        "p",
                        {},
                        ["x"]
                    ), v(
                        _ns$otherWrapper,
                        {
                            props: {
                                c: "item.literal",
                                d: this.otherProp.literal
                            }
                        },
                        f([i(this.item.otherList, (innerItem, index2) => {
                            return h(
                                "div",
                                {
                                    "class": "my-list"
                                },
                                [v(
                                    _a$b,
                                    {
                                        props: {
                                            c: "innerItem.literal",
                                            d: innerItem.literal,
                                            e: this.otherProp2.literal,
                                            f: item.x
                                        }
                                    },
                                    [s(item), " ", s(item.foo), " ", s(innerItem.x), " ", s(this.nonScoped.bar), " ", s(this.foo), " ", s(Math.random())]
                                )]
                            );
                        })])
                    )]
                )]
            );
        })])
    );
}
export const usedIdentifiers = ["items", "item.x", "otherProp.literal", "item.otherList", "innerItem.literal", "otherProp2.literal", "foo"];
