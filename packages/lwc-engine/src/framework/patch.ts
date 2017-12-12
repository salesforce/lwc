import { init } from "../3rdparty/snabbdom/snabbdom";

import componentInit from "./modules/component-init";
import componentProps from "./modules/component-props";
import componentEvents from "./modules/component-events";
import componentClasses from "./modules/component-classes";
import componentSlotset from "./modules/component-slotset";
import props from "./modules/props";
import attrs from "./modules/attrs";
import styles from "./modules/styles";
import classes from "./modules/classes";
import events from "./modules/events";
import token from "./modules/token";
import uid from "./modules/uid";

export const patch = init([
    componentInit,
    componentSlotset,
    componentProps,
    // from this point on, we do a series of DOM mutations
    componentEvents,
    componentClasses,

    // Attrs need to be applied to element before props
    // IE11 will wipe out value on radio inputs if value
    // is set before type=radio.
    // See https://git.soma.salesforce.com/raptor/raptor/issues/791 for more
    attrs,
    props,
    classes,
    styles,
    events,
    token,
    uid,
]);
