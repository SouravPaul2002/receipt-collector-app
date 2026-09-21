import { ApiResponse } from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

const refreshAccessToken = async (): Promise<boolean> => {
    try {
        const res = await fetch(`${API_URL}/auth/refresh-token`, {
            method: 'POST',
            credentials: 'include'
        })
        return res.ok
    } catch {
        return false
    }
}

export const apiFetch = async <T = unknown>(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false
): Promise<ApiResponse<T>> => {
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData

    const headers: HeadersInit = {
        ...(!isFormData && { 'Content-Type': 'application/json' }),
        ...(options.headers || {})
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        credentials: 'include',
        headers
    })

    const isAuthEndpoint =
        endpoint.includes('/auth/login') ||
        endpoint.includes('/auth/register') ||
        endpoint.includes('/auth/refresh-token')

    // access token expired — try a silent refresh, once, then retry the original request
    if (res.status === 401 && !isRetry && !isAuthEndpoint) {
        if (!isRefreshing) {
            isRefreshing = true
            refreshPromise = refreshAccessToken().finally(() => {
                isRefreshing = false
                refreshPromise = null
            })
        }

        const refreshed = await refreshPromise
        if (refreshed) {
            return apiFetch<T>(endpoint, options, true) // retry original request once
        }

        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.href = '/login' // refresh token is expired or invalid
        }
        throw new Error('Session expired')
    }

    let data: ApiResponse<T>
    try {
        data = await res.json()
    } catch {
        data = {
            statusCode: res.status,
            data: null as T,
            message: res.statusText || 'Request failed',
            success: res.ok
        }
    }

    if (!res.ok) {
        throw new Error(data.message || 'Request failed')
    }
    return data
}