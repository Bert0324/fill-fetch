import { merge } from 'lodash-es';
import { IConfig, IInterceptor, Fetch, IFilledFetch } from './index.d';

export class FetchFiller {

    config: IConfig = {
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'x-requested-with': 'XMLHttpRequest'
        },
        baseURL: location.origin,
        timeout: 5000,
        maxConcurrence: 10
    };

    interceptors: IInterceptor = {
        request: [],
        response: [],
        errorHandlers: []
    };

    private rawFetch: Fetch = window.fetch.bind(window);

    private currentRequest = 0;

    constructor() {
        this.interceptors.request.use = interceptor => this.interceptors.request.push(interceptor);
        this.interceptors.response.use = (interceptor, catcher) => {
            this.interceptors.response.push(interceptor);
            if (catcher) {
                this.interceptors.errorHandlers.push(catcher);
            }
        };
    }

    private async setConfig(config?: IConfig) {
        const mergedConfig = merge(this.config, config || {});
        await Promise.all(this.interceptors.request.map(c => c(mergedConfig)));
        return mergedConfig;
    }

    private async setResponse<T>(res: any) {
        await Promise.all(this.interceptors.response.map(c => c(res)));
        return res as T;
    }

    async catchError(err: any) {
        const handlers = [...this.interceptors.errorHandlers];
        const handleError = async (e: any) => {
            const handler = handlers.shift();
            if (handler) {
                const res = await handler(e);
                await handleError(res);
            } else {
                return e;
            }
        };
        return handleError(err);
    }

    private async withTimeoutAndWaitForMaxConcurrence(task: () => Promise<any>, timeout: number, abort: () => void) {
        try {
            const res = await this.waitForMaxConcurrence(() => Promise.race([
                task(),
                new Promise((_, reject) => setTimeout(() => {
                    abort();
                    reject(new Error('request timeout'));
                }, timeout))
            ]));
            this.currentRequest -= 1;
            return res;
        } catch (e) {
            this.currentRequest -= 1;
            Promise.reject(e);
        }
    }

    private async waitForMaxConcurrence<T>(task: () => Promise<T>) {
        if (this.currentRequest >= this.config.maxConcurrence) {
            (window as any).requestIdleCallback(() => this.waitForMaxConcurrence(task));
        } else {
            this.currentRequest += 1;
            return task();
        }
    }

    private responseBinding(responseTask: () => Promise<any>) {
        return async () => {
            const res = await responseTask();
            return this.setResponse<any>(res);
        }
    }

    async get<T = any>(path: string, params?: any, config?: IConfig): Promise<T> {
        try {
            const mergedConfig = await this.setConfig(config);
            Object.keys(params || {}).forEach(key => url.searchParams.append(key, params[key]));
            const url = new URL(`${mergedConfig.baseURL}${path}`);
            const { signal, abort } = new AbortController();
            const res = await this.withTimeoutAndWaitForMaxConcurrence(async () => (await this.rawFetch(url.href, {
                ...mergedConfig,
                method: 'GET',
                signal
            })).json(), mergedConfig.timeout, abort);
            return this.setResponse<T>(res);
        } catch (error) {
            return this.catchError(error);
        }
    }

    async post<T = any>(path: string, data?: any, config?: IConfig): Promise<T> {
        try {
            const mergedConfig = await this.setConfig(config);
            const url = new URL(`${mergedConfig.baseURL}${path}`);
            const { signal, abort } = new AbortController();
            const res = await this.withTimeoutAndWaitForMaxConcurrence(async () => (await this.rawFetch(url.href, {
                ...mergedConfig,
                method: 'POST',
                body: data ? JSON.stringify(data) : '',
                signal
            })).json(), mergedConfig.timeout, abort);
            return this.setResponse<T>(res);
        } catch (error) {
            return this.catchError(error);
        }
    }

    fetchBinding() {
        window.fetch = async (input: RequestInfo, init?: RequestInit) => {
            try {
                const mergedConfig = await this.setConfig(init);
                const { signal, abort } = new AbortController();
                const res = await this.withTimeoutAndWaitForMaxConcurrence(() => this.rawFetch(input, {
                    ...mergedConfig,
                    signal
                }), mergedConfig.timeout, abort) as Response;
                res.json = this.responseBinding(res.json);
                res.text = this.responseBinding(res.text);
                res.blob = this.responseBinding(res.blob);
                res.arrayBuffer = this.responseBinding(res.arrayBuffer);
                res.formData = this.responseBinding(res.formData);
                return res;
            } catch (error) {
                return this.catchError(error);
            }
        };
        (window.fetch as any).get = this.get.bind(this);
        (window.fetch as any).post = this.post.bind(this);
        (window.fetch as any).interceptors = this.interceptors;
        (window.fetch as any).config = this.config;
        return window.fetch as IFilledFetch;
    }

}

