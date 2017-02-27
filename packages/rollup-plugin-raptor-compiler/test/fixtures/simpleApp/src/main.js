import { createElement } from "raptor";
import App from "x:app";
const container = document.getElementById('main');
const element = createElement('x-app', { is: App });
container.appendChild(element);
