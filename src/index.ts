import { FetchFiller } from "./fetcher"

export const fill = () => {
    const filler = new FetchFiller();
    filler.fetchBinding();
};
