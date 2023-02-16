import { LightningElement, track } from 'lwc';

export default class extends LightningElement {
    counter = 0;
    thing = { number: 46 };
    foo = null;
    bar = 'hey there!';
    @track movieLikes = {
        'Truman Show': 0,
        'Serenity': 0,
        'The Departed': 0,
    };

    get attrColorStyle() {
        return 'color: blue';
    }

    increment() {
        this.counter++;
    }

    decrement() {
        this.counter--;
    }

    incrementNested() {
        this.thing = {
            ...this.thing,
            number: this.thing.number + 1,
        };
    }

    decrementMovieLike(movieName) {
        this.movieLikes[movieName] -= 1;
    }

    incrementMovieLike(movieName) {
        this.movieLikes[movieName] += 1;
    }
}
