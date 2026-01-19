import "../css/MovieCard.css"
import { useMovieContext } from "../contexts/index"
import { useState } from "react"
import { Link } from "react-router-dom"


type MovieCardProps = {
    movie: { title: string; release_date: string; poster_path?: string; id: number; genre_ids?: number[] }
    genreMap?: Record<number, string>
}

function MovieCard({ movie, genreMap }: MovieCardProps) {
    const {isFavorite, addToFavorites, removeFromFavorites} = useMovieContext()
    const [isUpdating, setIsUpdating] = useState(false)
    const favorite = isFavorite(movie.id)

    async function onFavoriteClick(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault()
        e.stopPropagation()
        if (isUpdating) return

        setIsUpdating(true)
        try {
            if (favorite) {
                await removeFromFavorites(movie.id)
            } else {
                await addToFavorites(movie)
            }
        } catch (error) {
            console.error('Failed to update favorite:', error)
        } finally {
            setIsUpdating(false)
        }
    }

    return <Link to={`/movie/${movie.id}`} className="movie-card">
        <div className="movie-poster">
            <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
            <div className="movie-overlay">
                <button 
                    className={`favorite-btn ${favorite ? "active" : ""} ${isUpdating ? "updating" : ""}`} 
                    onClick={onFavoriteClick}
                    disabled={isUpdating}
                >
                    ♥
                </button>
            </div>
        </div>
        <div className="movie-info">
            <h3>{movie.title}</h3>
            <p>{movie.release_date?.split("-")[0]}</p>
            {movie.genre_ids && movie.genre_ids.length > 0 && (
                <div className="genre-chips">
                    {(movie.genre_ids || []).map((gid) => {
                        const name = genreMap?.[gid]
                        if (!name) return null
                        return (
                            <Link key={gid} to={`/?genre=${gid}`} className="genre-chip">
                                {name}
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    </Link>
}

export default MovieCard