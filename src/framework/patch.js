import className from "./modules/klass.js";
import componentInit from "./modules/component-init.js";
import componentProps from "./modules/component-props.js";
import componentSlotset from "./modules/component-slotset.js";
import componentClassList from "./modules/component-klass.js";
import componentEvents from "./modules/component-events.js";
import componentChildren from "./modules/component-children.js";
import props from "./modules/props.js";

import { init } from "snabbdom";
import attrs from "snabbdom/modules/attributes";
import style from "snabbdom/modules/style";
import dataset from "snabbdom/modules/dataset";
import on from "snabbdom/modules/eventlisteners";

export const patch = init([
    componentInit,
    componentClassList,
    componentSlotset,
    componentProps,
    componentEvents,
    componentChildren,
    props,
    attrs,
    style,
    dataset,
    className,
    on,
]);
