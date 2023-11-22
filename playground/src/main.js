import "@lwc/synthetic-shadow"
import { createElement } from "lwc";
import Parent from "x/parent";


const elm = createElement("x-parent", { is: Parent });

document.body.appendChild(elm);  