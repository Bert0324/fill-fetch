# fill-fetch

A modern, high performance extension of `fetch` api.

## Installing

- `npm i fill-fetch`
- `yarn add fill-fetch`

## Features

- based on `fetch`, offer same api with it
- real cancelable request via `AbortController`
- better performance in large concurrence by `requestIdleCallback`
- easy to use
- fully Typescript support

## Use

```ts
import { fill } from 'fill-fetch';

const fetcher = fill();

fetcher.config.timeout = 3000;
fetcher.config.maxConcurrence = 10;
fetcher.config.baseURL = 'http://www.github.com';

fetcher.interceptors.request.use((config) => {
    config.headers = {
        'Connection': 'keep-alive'
    };
    return config;
});

fetcher.interceptors.response.use((response) => {
    return {
        code: 200,
        data: response.data,
        msg: ''
    };
}, (error) => {
    Promise.reject(error);
});

const res = await fetcher.get('/', { a: 1 }, {
    headers: {
        'bearer': '1234'
    }
});

const data = await (await fetcher('/')).json();
```

## Compatibility

- Chrome 66 +
- Edge 79 +
- Firefox 57 +
- Safari 13.1 + (enable `requestIdleCallback` in Experimental Features)
