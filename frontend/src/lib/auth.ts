import Cookies from 'js-cookie'

const ACCESS_TOKEN_KEY = 'ielts_access_token'
const REFRESH_TOKEN_KEY = 'ielts_refresh_token'
const USER_KEY = 'ielts_user'

export function getToken(): string | undefined {
  return Cookies.get(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | undefined {
  return Cookies.get(REFRESH_TOKEN_KEY)
}

export function setTokens(access: string, refresh: string): void {
  Cookies.set(ACCESS_TOKEN_KEY, access, { expires: 1 })
  Cookies.set(REFRESH_TOKEN_KEY, refresh, { expires: 7 })
}

export function removeTokens(): void {
  Cookies.remove(ACCESS_TOKEN_KEY)
  Cookies.remove(REFRESH_TOKEN_KEY)
  Cookies.remove(USER_KEY)
}

export function setUser(user: any): void {
  Cookies.set(USER_KEY, JSON.stringify(user), { expires: 1 })
}

export function getUser(): any | null {
  const user = Cookies.get(USER_KEY)
  return user ? JSON.parse(user) : null
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

export function getUserRole(): string | null {
  const user = getUser()
  return user?.role || null
}
