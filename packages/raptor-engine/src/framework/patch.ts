import componentInit from "./modules/component-init";
import componentProps from "./modules/component-props";
import componentAttrs from "./modules/component-attrs";
import componentEvents from "./modules/component-events";
import componentClasses from "./modules/component-classes";
import componentSlotset from "./modules/component-slotset";
import componentChildren from "./modules/component-children";
import props from "./modules/props";

import { init } from "../3rdparty/snabbdom/snabbdom";
import attrs from "./modules/attrs";
import styles from "./modules/styles";
import classes from "./modules/classes";
import events from "./modules/events";
import uid from "./modules/uid";

export const patch = init([
    componentInit,
    componentSlotset,
    componentProps,
    componentAttrs,
    componentChildren,
    // from this point on, we do a series of DOM mutations
    componentEvents,
    componentClasses,
    props,
    attrs,
    classes,
    styles,
    events,
    uid,
]);
