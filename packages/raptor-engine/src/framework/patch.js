import componentInit from "./modules/component-init.js";
import componentProps from "./modules/component-props.js";
import componentAttrs from "./modules/component-attrs.js";
import componentClasses from "./modules/component-classes.js";
import componentSlotset from "./modules/component-slotset.js";
import componentEvents from "./modules/component-events.js";
import componentChildren from "./modules/component-children.js";
import props from "./modules/props.js";

import { init } from "snabbdom";
import attrs from "snabbdom/modules/attributes";
import styles from "snabbdom/modules/style";
import classes from "snabbdom/modules/class";
import events from "snabbdom/modules/eventlisteners";

export const patch = init([
    componentInit,
    componentSlotset,
    componentProps,
    componentAttrs,
    componentClasses,
    componentEvents,
    componentChildren,
    props,
    attrs,
    classes,
    styles,
    events,
]);
