# Locker Service Membrane

This package implements a membrane for locker service integration. It supports distorting objects within an object graph for extra security and access checks.

 ### Usage

This package exposes one primitive:

'''js
import { Membrane } from 'locker-membrane';

function distortion (value) {
    console.log('distorting');

    if (value === 2) {
        return 4;
    }

    return value;
}

const plainObject = {
    x: 2,
    y: 1
};

const membrane = new Membrane(distortion); // create new membrane
const seed = membrane.piercingHook(plainObject); // console output -> 'distorting'. Returns membrane proxy.
seed.x // 4
seed.y // 1
```

