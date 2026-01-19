import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { getMovieDetails, getReviews } from "../services/api"
import { useMovieContext } from "../contexts/useMovieContext"
import Carousel from "../components/Carousel"
import PostReview from "../components/PostReview"
import "../css/MovieCard.css"

type MovieDetail = {
    id: number
    title: string
    overview: string
    release_date: string
    poster_path: string | null
    backdrop_path: string | null
    vote_average: number
    runtime: number
    genres: { id: number; name: string }[]
    credits: {
        cast: { id: number; name: string; character: string; profile_path: string | null }[]
    }
    videos: {
        results: { id: string; key: string; type: string; site: string }[]
    }
}

type Review = {
    id: number
    rating: number
    comment: string
    createdAt: string
    user: {
        fullName: string | null
    }
}

function MovieDetails() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { addToFavorites, removeFromFavorites, isFavorite } = useMovieContext()
    const [movie, setMovie] = useState<MovieDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [reviews, setReviews] = useState<Review[]>([])
    const [loadingReviews, setLoadingReviews] = useState(false)

    useEffect(() => {
        const loadMovie = async () => {
            if (!id) return

            try {
                setLoading(true)
                const data = await getMovieDetails(parseInt(id))
                setMovie(data)

                // Carica le recensioni
                await loadReviews(parseInt(id))
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load movie')
            } finally {
                setLoading(false)
            }
        }

        loadMovie()
    }, [id])

    const loadReviews = async (movieId: number) => {
        try {
            setLoadingReviews(true)
            const reviewsData = await getReviews(movieId)
            setReviews(reviewsData)
        } catch (err) {
            console.error('Failed to load reviews:', err)
            setReviews([])
        } finally {
            setLoadingReviews(false)
        }
    }

    const handleFavorite = async () => {
        if (!movie) return

        try {
            if (isFavorite(movie.id)) {
                await removeFromFavorites(movie.id)
            } else {
                await addToFavorites({
                    id: movie.id,
                    title: movie.title,
                    release_date: movie.release_date,
                    poster_path: movie.poster_path || undefined,
                })
            }
        } catch (err) {
            console.error('Failed to toggle favorite:', err)
        }
    }

    const handleReviewSubmitted = async () => {
        if (movie) {
            await loadReviews(movie.id)
        }
    }

    if (loading) {
        return <div className="loading">Loading movie details...</div>
    }

    if (error || !movie) {
        return <div className="error">Error: {error || 'Movie not found'}</div>
    }

    const trailer = movie.videos.results.find(
        (video) => video.type === 'Trailer' && video.site === 'YouTube'
    )

    return (
        <div className="movie-details">
            <button className="back-button" onClick={() => navigate(-1)}>
                ← Back
            </button>

            {movie.backdrop_path && (
                <div
                    className="backdrop"
                    style={{
                        backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
                    }}
                />
            )}

            <div className="movie-content">
                <div className="movie-poster">
                    {movie.poster_path ? (
                        <img
                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                            alt={movie.title}
                        />
                    ) : (
                        <div className="no-poster">No Image</div>
                    )}
                </div>

                <div className="movie-info">
                    <h1>{movie.title}</h1>

                    <div className="movie-meta">
                        <span className="rating">⭐ {movie.vote_average.toFixed(1)}</span>
                        <span className="release-year">
                            {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                        </span>
                        <span className="runtime">{movie.runtime} min</span>
                    </div>

                    <div className="genres">
                        {movie.genres.map((genre) => (
                            <Link key={genre.id} to={`/?genre=${genre.id}`} className="genre-tag">
                                {genre.name}
                            </Link>
                        ))}
                    </div>

                    <button
                        className={`favorite-btn ${isFavorite(movie.id) ? 'active' : ''}`}
                        onClick={handleFavorite}
                    >
                        {isFavorite(movie.id) ? '❤️ Rimuovi dai Preferiti' : '🤍 Aggiungi ai Preferiti'}
                    </button>

                    <div className="overview">
                        <h2>Overview</h2>
                        <p>{movie.overview || 'No overview available'}</p>
                    </div>

                    {trailer && (
                        <div className="trailer">
                            <h2>Trailer</h2>
                            <iframe
                                width="100%"
                                height="400"
                                src={`https://www.youtube.com/embed/${trailer.key}`}
                                title="Movie Trailer"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    )}

                    {movie.credits.cast.length > 0 && (
                        <div className="cast">
                            <h2>Cast</h2>
                            <Carousel itemsPerPage={4}>
                                {movie.credits.cast.slice(0, 12).map((actor) => (
                                    <div key={actor.id} className="cast-member">
                                        {actor.profile_path ? (
                                            <img
                                                src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                                                alt={actor.name}
                                            />
                                        ) : (
                                            <div className="no-photo">👤</div>
                                        )}
                                        <div className="actor-name">{actor.name}</div>
                                        <div className="character">{actor.character}</div>
                                    </div>
                                ))}
                            </Carousel>
                        </div>
                    )}

                    <PostReview movieId={movie.id} onReviewSubmitted={handleReviewSubmitted} />

                    {/* Storico delle recensioni */}
                    <div className="reviews-list">
                        <h3>Recensioni Precedenti</h3>
                        {loadingReviews ? (
                            <p>Caricamento recensioni...</p>
                        ) : reviews.length > 0 ? (
                            <div className="reviews-container">
                                {reviews.map((review) => (
                                    <div key={review.id} className="review-item">
                                        <div className="review-header">
                                            <div className="review-author">
                                                <span className="author-name">{review.user.fullName}</span>
                                                <span className="review-date">
                                                    {new Date(review.createdAt).toLocaleDateString('it-IT')}
                                                </span>
                                            </div>
                                            <div className="review-rating">
                                                {Array.from({ length: 5 }, (_, i) => (
                                                    <span key={i} className={`star ${i < review.rating ? 'filled' : ''}`}>
                                                        ★
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="review-content">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>Nessuna recensione disponibile.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MovieDetails
