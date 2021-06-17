import { LightningElement } from "lwc";
import isRegexp from 'is-regexp'

export default class App extends LightningElement {
    isRegex = isRegexp(/foo/)
}
