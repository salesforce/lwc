import componentInit from "./modules/component-init.js";
import componentProps from "./modules/component-props.js";
import componentAttrs from "./modules/component-attrs.js";
import componentSlotset from "./modules/component-slotset.js";
import componentEvents from "./modules/component-events.js";
import componentChildren from "./modules/component-children.js";
import props from "./modules/props.js";

import { init } from "snabbdom";
import attrs from "snabbdom/modules/attributes";
import style from "snabbdom/modules/style";
import on from "snabbdom/modules/eventlisteners";

export const patch = init([
    componentInit,
    componentSlotset,
    componentProps,
    componentAttrs,
    componentEvents,
    componentChildren,
    props,
    attrs,
    style,
    on,
]);
