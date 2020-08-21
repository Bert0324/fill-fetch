export interface IConfig extends RequestInit {
    baseURL?: string;
    timeout?: number;
    maxConcurrence?: number;
}

export type requestInterceptor = (config: IConfig) => IConfig | Promise<IConfig>;
export type responseInterceptor = <T = any>(response: T) => T | Promise<T>;
export type responseErrorCatch = <T = any>(err: any) => T | Promise<T>;

export interface IInterceptor {
    request: requestInterceptor[] & {
        use?: (interceptor: requestInterceptor) => void;
    };
    response: responseInterceptor[] & {
        use?: (interceptor: responseInterceptor, catcher?: responseErrorCatch) => void;
    };
    errorHandlers: responseErrorCatch[];
}

export type Fetch = typeof fetch;
export interface IFilledFetch extends Fetch {
    get<T = any>(path: string, params?: any, config?: IConfig): Promise<T>;
    post<T = any>(path: string, data?: any, config?: IConfig): Promise<T>;
    interceptors: IInterceptor;
    config: IConfig;
}
