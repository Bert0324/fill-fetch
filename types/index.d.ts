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
     * AbortController instance
     * @default undefined
     */
    abortController?: {
        signal: AbortSignal;
        abort: () => void;
    };
    [key: string]: any;
}

export type requestInterceptor = (config: IConfig) => IConfig | Promise<IConfig>;
export type responseInterceptor = <T = any>(response: T) => T | Promise<T>;
export type responseErrorCatch = (err: any) => any;

export interface IInterceptor {
    /**
     * request interceptors
     */
    request: requestInterceptor[] & {
        /**
         * append callback to request interceptor
         */
        use: (interceptor: requestInterceptor) => void;
    };
    /**
     * response interceptors
     */
    response: responseInterceptor[] & {
        /**
         * append callback to response interceptor
         */
        use: (interceptor: responseInterceptor, catcher?: responseErrorCatch) => void;
    };
    errorHandlers: responseErrorCatch[];
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
    function fill(): IFilledFetch;
}
