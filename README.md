# fill-fetch

## Installing

- `npm i fill-fetch`
- `yarn add fill-fetch`

## Use

```ts
import { fill } from 'fill-fetch';

fill();

fetch.config.timeout = 3000;
fetch.config.maxConcurrence = 10;

fetch.interceptors.request.use((config) => {
    config.baseURL = 'http://www.github.com';
    return config;
});

fetch.interceptors.response.use((response) => {
    return {
        code: 200,
        data: response.data,
        msg: ''
    };
}, (error) => {
    Promise.reject(error);
});

const res = await fetch.get('/', { a: 1 }, {
    headers: {
        'bearer': '1234'
    }
});

const data = await (await fetch('/')).json();
```

## Notice

This project uses some of new browser API including: `fetch`, `requestIdleCallback`, `AbortController`.
