export default function ({
    i,
    f,
    e,
    h
}) {
    return h(
        "section",
        null,
        [h(
            "ns:outerItem",
            { "class": "", props: { "aura-for": "(item, index) of items" }
            },
            [h(
                "div",
                { "class": "wrapper" },
                [h(
                    "p",
                    {
                        props: { "aura-if": "item.x" }
                    },
                    ["x"]
                ), h(
                    "p",
                    {
                        props: { "aura-else": true }
                    },
                    ["x"]
                ), h(
                    "ns:otherWrapper",
                    {
                        props: { c: "item.literal", "d": this.otherProp.literal }
                    },
                    [h(
                        "div",
                        { "class": "my-list", props: { "aura-for": "(innerItem, index2) of item.otherList" }
                        },
                        [h(
                            "a:b",
                            {
                                props: { c: "innerItem.literal", "d": this.innerItem.literal, "e": this.otherProp2.literal, "f": this.item.x }
                            },
                            [this.item, " ", this.item.foo, " ", this.innerItem.x, " ", this.nonScoped.bar, " ", this.foo, " ", Math.random()]
                        )]
                    )]
                )]
            )]
        )]
    );
}
