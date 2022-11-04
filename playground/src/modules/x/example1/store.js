import { signal, batch } from "@preact/signals-core";

const cities = [
    signal({id: '1', name: 'San Francisco', population: 500}),
    signal({id: '2', name: 'Miami', population: 750}),
    signal({id: '3', name: 'New York', population: 1000}),
];

function getById(id) {
    return cities.find(city => {
        const c = city.peek();

        return c.id === id;
    });
}

export function getCities(filter) {
    if (!filter) {
        return cities;
    }

    return cities.filter(({ value: { name }}) => name.includes(filter));
}

export function saveCity({ id, name, population }) {
    const city = getById(id);

    city.value = {
        id,
        name,
        population
    };
}