import { ApiResponse } from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const apiFetch = async <T = unknown>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> => {
    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        credentials: 'include', // sends HTTP-only cookies cross-origin
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    })

    const data: ApiResponse<T> = await res.json()
    if (!res.ok) {
        throw new Error(data.message || 'Request failed')
    }
    return data
}