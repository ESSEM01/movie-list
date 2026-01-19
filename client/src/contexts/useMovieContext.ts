import { useContext } from "react"
import { MovieContext } from "./MovieContext"

export const useMovieContext = () => {
  const ctx = useContext(MovieContext)
  if (!ctx) throw new Error("useMovieContext must be used within MovieProvider")
  return ctx
}
