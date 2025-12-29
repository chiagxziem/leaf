import axios, { type AxiosError } from "axios";

import env from "./env";

export const axiosClient = axios.create({
  baseURL: env.API_URL,
});

export const axiosErrMsg = (err: AxiosError) => {
  return {
    status: err.response?.status,
    statusText: err.response?.statusText,
    method: err.config?.method,
    url: err.config?.url,
    data: err.response?.data,
  };
};
