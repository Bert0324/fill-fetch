/**
 * request configuration types
 */
export interface IConfig extends RequestInit {
    /**
     * base url
     * @default location.origin
     */
    baseURL?: string;
    /**
     * request timeout
     * @default 5000
     */
    timeout?: number;
    /**
     * max concurrence
     * @default 10
     */
    maxConcurrence?: number;
    /**
     * custom AbortController instance
     * @default undefined
     */
    abortController?: {
        signal: AbortSignal;
        abort: () => void;
    };
    [key: string]: any;
}

export type RequestInterceptor = (config: IConfig) => IConfig | Promise<IConfig>;
export type ResponseInterceptor = <T = any>(response: T) => T | Promise<T>;
export type ResponseErrorCatch = (err: any) => any;

export interface IInterceptor {
    /**
     * request interceptors
     */
    request: RequestInterceptor[] & {
        /**
         * append callback to request interceptor
         */
        use: (interceptor: RequestInterceptor) => void;
    };
    /**
     * response interceptors
     */
    response: ResponseInterceptor[] & {
        /**
         * append callback to response interceptor
         */
        use: (interceptor: ResponseInterceptor, catcher?: ResponseErrorCatch) => void;
    };
    errorHandlers: ResponseErrorCatch[];
}

export type Fetch = typeof fetch;
export interface IFilledFetch extends Fetch {
    /**
     * quick get function
     */
    get<T = any>(path: string, params?: any, config?: IConfig): Promise<T>;
    /**
     * quick post function
     */
    post<T = any>(path: string, data?: any, config?: IConfig): Promise<T>;
    /**
     * interceptors
     */
    interceptors: IInterceptor;
    /**
     * request configuration
     */
    config: IConfig;
}

declare module 'fill-fetch' {
    /**
     * fill native `window.fetch`
     */
    export const fill: () => IFilledFetch;
    export default fill;
}
