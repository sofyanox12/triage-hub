import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import type { ApiErrorResponse, ApiSuccessResponse } from './api'

import { API_BASE_URL, STORAGE_KEYS } from '@/lib/constants'
import { StatusCode } from '@triage/shared'

const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/`,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

axiosInstance.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error: AxiosError) => {
    const data = error.response?.data as ApiErrorResponse | undefined

    if (error.response?.status === StatusCode.UNAUTHORIZED) {
      if (typeof window !== 'undefined') {
        const isLoginPage = window.location.pathname === '/login'
        if (!isLoginPage) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/login'
        }
      }
    }

    if (data && data.success === false) {
      return Promise.reject({
        status: error.response?.status,
        message: data.message || error.message,
        errors: data.errors,
        code: data.errorCode,
        config: error.config,
      })
    }

    return Promise.reject(error)
  }
)

const http = {
  axios: axiosInstance,
  get: <TResponse>(url: string, config?: AxiosRequestConfig) =>
    (
      axiosInstance.get(url, config) as Promise<
        ApiSuccessResponse<TResponse>
      >
    ).then((res) => {
      if (res.meta)
        return {
          data: res.data,
          meta: res.meta,
        } as unknown as TResponse
      return res.data
    }),
  post: <TResponse, TBody = unknown>(
    url: string,
    body: TBody,
    config?: AxiosRequestConfig
  ) =>
    (
      axiosInstance.post(url, body, config) as Promise<
        ApiSuccessResponse<TResponse>
      >
    ).then((res) => {
      if (res.meta)
        return {
          data: res.data,
          meta: res.meta,
        } as unknown as TResponse
      return res.data
    }),
  put: <TResponse, TBody = unknown>(
    url: string,
    body: TBody,
    config?: AxiosRequestConfig
  ) =>
    (
      axiosInstance.put(url, body, config) as Promise<
        ApiSuccessResponse<TResponse>
      >
    ).then((res) => {
      if (res.meta)
        return {
          data: res.data,
          meta: res.meta,
        } as unknown as TResponse
      return res.data
    }),
  patch: <TResponse, TBody = unknown>(
    url: string,
    body: TBody,
    config?: AxiosRequestConfig
  ) =>
    (
      axiosInstance.patch(url, body, config) as Promise<
        ApiSuccessResponse<TResponse>
      >
    ).then((res) => {
      if (res.meta)
        return {
          data: res.data,
          meta: res.meta,
        } as unknown as TResponse
      return res.data
    }),
  delete: <TResponse>(url: string, config?: AxiosRequestConfig) =>
    (
      axiosInstance.delete(url, config) as Promise<
        ApiSuccessResponse<TResponse>
      >
    ).then((res) => {
      if (res.meta)
        return {
          data: res.data,
          meta: res.meta,
        } as unknown as TResponse
      return res.data
    }),
}

export { http }
