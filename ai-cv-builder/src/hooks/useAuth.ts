import { useUserStore } from '@/store'
import { User } from '@/types/user.types'

export function useAuth() {
  const user = useUserStore((state) => state.user)
  const isAuthenticated = useUserStore((state) => state.isAuthenticated)
  const isLoading = useUserStore((state) => state.isLoading)
  const setUser = useUserStore((state) => state.setUser)
  const clearUser = useUserStore((state) => state.clearUser)
  const updateUser = useUserStore((state) => state.updateUser)

  // Mock login - will be replaced in Step 5 with real auth
  const login = async (email: string, _password: string) => {
    try {
      // TODO: Replace with real API call
      const mockUser: User = {
        id: '1',
        email,
        firstName: 'John',
        lastName: 'Doe',
        language: 'en',
        theme: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setUser(mockUser)
      return { success: true }
    } catch {
      return { success: false, error: 'Login failed' }
    }
  }

  const logout = () => {
    clearUser()
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
  }
}