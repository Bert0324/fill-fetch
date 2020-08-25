import { FetchFiller } from "./fetcher";

const fill = () => new FetchFiller().fetchBinding();
export { fill }; 
export default fill;
