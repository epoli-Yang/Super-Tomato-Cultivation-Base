import { SUPABASE_CONFIG } from '@/config/api'

const request = (url, method, data) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url,
      method,
      data,
      header: {
        apikey: SUPABASE_CONFIG.ANON_KEY,
        Authorization: `Bearer ${SUPABASE_CONFIG.ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      success: (res) => {
        const body = res && typeof res.data === 'object' ? res.data : {}
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ data: body, error: null })
          return
        }
        resolve({
          data: null,
          error: {
            message: body.msg || body.error_description || body.error || '请求失败'
          }
        })
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

export const supabaseAuth = {
  signUp({ email, password, options }) {
    return request(`${SUPABASE_CONFIG.URL}/auth/v1/signup`, 'POST', {
      email,
      password,
      data: (options && options.data) || {}
    })
  },
  signInWithPassword({ email, password }) {
    return request(`${SUPABASE_CONFIG.URL}/auth/v1/token?grant_type=password`, 'POST', {
      email,
      password
    })
  }
}
