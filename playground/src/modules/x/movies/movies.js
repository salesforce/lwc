import { LightningElement, track } from 'lwc';
import mockData from './data';

const initialData = [...mockData];
const productionYearRange = initialData.reduce(({ min, max }, movie) => ({
    min: movie.year < min ? movie.year : min,
    max: movie.year > max ? movie.year : max,
}), { min: Infinity, max: 0 });

export default class extends LightningElement {
    applyFilter = true;
    @track movies = [...mockData];
    productionYearRange = productionYearRange;
    productionYearCutoff = productionYearRange.min;

    sortByVotes(movies) {
        return movies.slice().sort((a, b) => b.votes - a.votes);
    }

    filter(movies) {
        return this.applyFilter
            ? movies.filter(movie => movie.year > (this.productionYearCutoff - 1))
            : movies;
    }
}
