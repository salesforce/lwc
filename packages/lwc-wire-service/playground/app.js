// bootstrapping process for App
import { createElement, register } from 'lwc';
import { registerWireService } from 'wire-service';
import App from 'x-demo';


registerWireService(register);

const container = document.getElementById('main');
const element = createElement('x-demo', { is: App });
container.appendChild(element);
