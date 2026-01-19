import { createContext, useState, useEffect } from "react"
import type { ReactNode } from "react"
import { getFavorites, addFavorite, removeFavorite, getCurrentUser } from "../services/api"

type User = { id: number; email: string; fullName: string | null }
type Movie = { id: number; title: string; release_date: string; poster_path?: string; url?: string }
type MovieContextValue = {
  favorites: Movie[]
  addToFavorites: (movie: Movie) => Promise<void>
  removeFromFavorites: (movieId: number) => Promise<void>
  isFavorite: (movieId: number) => boolean
  isLoading: boolean
  error: string | null
  user: User | null
  setUser: (user: User | null) => void
}

const MovieContext = createContext<MovieContextValue | null>(null)

export { MovieContext }

export const MovieProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)

  // Load user and favorites on mount
  useEffect(() => {
    const loadUserAndFavorites = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        
        if (currentUser) {
          const data = await getFavorites()
          setFavorites(data)
        }
      } catch (err) {
        // Silently handle errors - user might not be authenticated
        setUser(null)
        setFavorites([])
      } finally {
        setIsLoading(false)
      }
    }

    loadUserAndFavorites()
  }, [])

  const addToFavorites = async (movie: Movie) => {
    try {
      setError(null)
      await addFavorite(movie)
      setFavorites(prev => [...prev, movie])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add favorite')
      throw err
    }
  }

  const removeFromFavorites = async (movieId: number) => {
    try {
      setError(null)
      await removeFavorite(movieId)
      setFavorites(prev => prev.filter(m => m.id !== movieId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove favorite')
      throw err
    }
  }

  const isFavorite = (movieId: number) => favorites.some(m => m.id === movieId)

  const value: MovieContextValue = { 
    favorites, 
    addToFavorites, 
    removeFromFavorites, 
    isFavorite,
    isLoading,
    error,
    user,
    setUser
  }

  return <MovieContext.Provider value={value}>{children}</MovieContext.Provider>
}