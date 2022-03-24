// @ts-ignore
import { createElement } from "lwc";
// @ts-ignore
import App from "ts/app";
import { doNothing } from "./utils";


const container = document.getElementById('main');
const element = createElement('ts-app', { is: App });
container.appendChild(element);

// testing relative import works
console.log('>>', doNothing());