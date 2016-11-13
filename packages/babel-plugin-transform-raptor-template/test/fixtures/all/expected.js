h(
    "section",
    null,
    [l(this.items, (item, index) => {
        return h(
            "ns:outerItem",
            { "class": "" },
            [h(
                "div",
                { "class": "wrapper" },
                [item.x ? h(
                    "p",
                    {},
                    ["x"]
                ) : h(
                    "p",
                    {},
                    ["x"]
                ), h(
                    "ns:otherWrapper",
                    {
                        attrs: { c: "item.literal", "d": this.otherProp.literal }
                    },
                    [l(this.item.otherList, (innerItem, index2) => {
                        return h(
                            "div",
                            { "class": "my-list" },
                            [h(
                                "a:b",
                                {
                                    attrs: { c: "innerItem.literal", "d": innerItem.literal, "e": this.otherProp2.literal, "f": item.x }
                                },
                                [item, " ", item.foo, " ", innerItem.x, " ", this.nonScoped.bar, " ", foo, " ", Math.random()]
                            )]
                        );
                    })]
                )]
            )]
        );
    })]
);
