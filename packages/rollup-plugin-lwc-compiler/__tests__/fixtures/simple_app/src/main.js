import { createElement } from "engine";
import App from "x-app";
const container = document.getElementById('main');
const element = createElement('x-app', { is: App });
container.appendChild(element);
