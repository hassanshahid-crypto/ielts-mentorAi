'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '@/lib/api'
import { setTokens, removeTokens, setUser, getUser, isAuthenticated as checkAuth } from '@/lib/auth'
import type { User, LoginRequest, RegisterRequest } from '@/types'

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = getUser()
    if (savedUser && checkAuth()) {
      setUserState(savedUser)
      api.getProfile().then((profile) => {
        setUserState(profile)
        setUser(profile)
      }).catch(() => {
        removeTokens()
        setUserState(null)
      })
    }
    setLoading(false)
  }, [])

  const login = async (data: LoginRequest) => {
    const response = await api.login(data)
    setTokens(response.tokens.access, response.tokens.refresh)
    setUser(response.user)
    setUserState(response.user)
  }

  const register = async (data: RegisterRequest) => {
    await api.register(data)
  }

  const logout = () => {
    removeTokens()
    setUserState(null)
    window.location.href = '/login'
  }

  const refreshUser = async () => {
    const profile = await api.getProfile()
    setUserState(profile)
    setUser(profile)
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user && checkAuth(),
      login,
      register,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
