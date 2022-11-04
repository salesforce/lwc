import { LightningElement, api } from "lwc";
import { saveCity } from "../example1/store";

export default class CityDetails extends LightningElement {
    @api city;
    isEditMode = false;

    handleSubmit(evt) {
        evt.preventDefault();
        const edited = Object.fromEntries(new FormData(evt.target));

        saveCity(edited);

        this.isEditMode = false;
    }

    handleCancel(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        this.isEditMode = false;
    }

    enterEditMode() {
        this.isEditMode = true;
    }

    renderedCallback() {
        console.log('Rendered [City]');
    }
}