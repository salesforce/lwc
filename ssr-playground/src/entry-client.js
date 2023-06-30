import { createElement } from "lwc";
import Parent from "x/parent";

const elm = createElement("x-parent", { is: Parent });
elm.tabIndex = 1;
document.body.appendChild(elm);
