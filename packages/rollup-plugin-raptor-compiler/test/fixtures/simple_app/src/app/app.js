import { Element } from "engine";
import html from "./app.html";

export default class App extends Element{
    constructor() {
        super();
        this.list = [];
    }
    render() {
        return html;
    }
}
