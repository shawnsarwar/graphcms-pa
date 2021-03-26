import axios, { AxiosInstance, AxiosResponse } from 'axios';

// cribbed from https://levelup.gitconnected.com/enhance-your-http-request-with-axios-and-typescript-f52a6c6c2c8e

declare module 'axios' {
  interface AxiosResponse<T = any> extends Promise<T> {}
}

abstract class HttpClient {
  protected readonly instance: AxiosInstance;

  public constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
    });

    this._initializeResponseInterceptor();
  }

  private _initializeResponseInterceptor = () => {
    this.instance.interceptors.response.use(
      this._handleResponse,
      this._handleError,
    );
  };

  private _handleResponse = ({ data }: AxiosResponse) => data;

  protected _handleError = (error: any) => {
    console.log(error);  
    Promise.reject(error)
  };
}

export {HttpClient};