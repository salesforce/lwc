// @ts-ignore
import { createElement } from "lwc";
// @ts-ignore
import App from "x/app";
import { doNothing } from "./utils";


const container = document.getElementById('main');
const element = createElement('x-app', { is: App });
container.appendChild(element);

// testing relative import works
doNothing();