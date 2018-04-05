// bootstrapping process for App
import { createElement, register } from 'engine';
import App from 'x-demo';

const container = document.getElementById('main');
const element = createElement('x-demo', { is: App });

container.appendChild(element);
