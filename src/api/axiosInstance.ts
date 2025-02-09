import axios from "axios";

declare module "axios" {
  interface AxiosResponse {
    code: number;
    msg: string;
  }
}

export const CARD_SERVICE =
  import.meta.env.MODE === "production"
    ? "https://example.com"
    : "http://localhost:5678";

// 创建请求实例
const instance = axios.create({
  baseURL: CARD_SERVICE,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求前处理
instance.interceptors.request.use(function (config) {
  // Do something before request is sent
  return config;
});

// 响应后处理
instance.interceptors.response.use(
  function (response) {
    console.log("axios response: ", response);
    if (response.status !== 200) {
      throw new Error(response?.msg);
    } else {
      return response;
    }
  },
  function (error: { response: { status: unknown }; message: unknown }) {
    //原生错误对象
    if (error.response) {
      // that falls out of the range of 2xx
      switch (error.response.status) {
        case 400:
          break;
        case 401:
          break;
        case 403:
          break;
        default:
      }
    } else if (typeof error.message === "string") {
      // Something happened in setting up the request that triggered an Error
      let message = error.message;
      if (message.indexOf("timeout") > -1) {
        message = "请求超时, 请重试";
      } else if (message.indexOf("Network") > -1) {
        message = "网络异常";
      } else if (message.indexOf("canceled") > -1) {
        // 请求取消
      } else {
        console.warn(message);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
