import componentInit from "./modules/component-init.js";
import componentProps from "./modules/component-props.js";
import componentAttrs from "./modules/component-attrs.js";
import componentEvents from "./modules/component-events.js";
import componentClasses from "./modules/component-classes.js";
import componentSlotset from "./modules/component-slotset.js";
import componentChildren from "./modules/component-children.js";
import props from "./modules/props.js";

import { init } from "../3rdparty/snabbdom/snabbdom.js";
import attrs from "./modules/attrs";
import styles from "./modules/styles";
import classes from "./modules/classes";
import events from "./modules/events";

export const patch = init([
    componentInit,
    componentSlotset,
    componentProps,
    componentAttrs,
    componentEvents,
    componentClasses,
    componentChildren,
    props,
    attrs,
    classes,
    styles,
    events,
]);
