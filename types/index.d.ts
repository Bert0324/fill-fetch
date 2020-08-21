import { IFilledFetch } from '../src/index.d';

declare module 'fill-fetch' {
    function fill(): IFilledFetch;
}