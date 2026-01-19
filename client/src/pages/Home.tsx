import MovieCard from "../components/MovieCard"
import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import { searchMovies, getPopularMovies, getGenres, discoverMoviesByGenre } from "../services/api"
import "../css/Home.css"

interface Movie {
    id: number;
    title: string;
    release_date: string;
    poster_path: string;
    genre_ids?: number[];
}

interface Genre {
    id: number;
    name: string;
}

function Home() {
    const [searchQuery, setSearchQuery] = useState("");
    const [movies, setMovies] = useState<Movie[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();

    const genreMap = useMemo<Record<number, string>>(() => {
        const map: Record<number, string> = {};
        for (const g of genres) map[g.id] = g.name;
        return map;
    }, [genres]);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [genresData, popularMovies] = await Promise.all([
                    getGenres(),
                    getPopularMovies()
                ]);
                setGenres(genresData);
                setMovies(popularMovies);
            } catch (err) {
                console.log(err);
                setError("Failed to load movies...");
            } finally {
                setLoading(false);
            }
        }

        loadInitialData();
    }, []);

    // Sync selectedGenre from URL (?genre=ID)
    useEffect(() => {
        const genreParam = searchParams.get("genre");
        setSelectedGenre(genreParam ? Number(genreParam) : null);
    }, [searchParams]);

    useEffect(() => {
        const loadMoviesByGenre = async () => {
            if (selectedGenre === null) {
                setLoading(true);
                try {
                    const popularMovies = await getPopularMovies();
                    setMovies(popularMovies);
                    setSearchQuery("");
                } catch (err) {
                    console.log(err);
                    setError("Failed to load movies...");
                } finally {
                    setLoading(false);
                }
                return;
            }

            setLoading(true);
            try {
                const genreMovies = await discoverMoviesByGenre(selectedGenre);
                setMovies(genreMovies);
                setSearchQuery("");
                setError(null);
            } catch (err) {
                console.log(err);
                setError("Failed to load movies by genre...");
            } finally {
                setLoading(false);
            }
        };

        loadMoviesByGenre();
    }, [selectedGenre])

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        if (loading) return;

        setLoading(true);
        setSelectedGenre(null);
        setSearchParams({}, { replace: true } as any);
        try {
            const searchResults = await searchMovies(searchQuery);
            setMovies(searchResults);
            setError(null);
        } catch (err) {
            console.log(err);
            setError("Failed to search movies...");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="home">
            <form onSubmit={handleSearch} className="search-form">
                <input
                    type="text"
                    placeholder="Search movies..."
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="search-button">Search</button>
            </form>

            <div className="genre-filter">
                <label htmlFor="genre-select">Filter by genre:</label>
                <select
                    id="genre-select"
                    className="genre-select"
                    value={selectedGenre ?? ''}
                    onChange={(e) => {
                        const val = e.target.value;
                        const next = val ? Number(val) : null;
                        setSelectedGenre(next);
                        if (next === null) {
                            setSearchParams({}, { replace: true } as any);
                        } else {
                            setSearchParams({ genre: String(next) }, { replace: true } as any);
                        }
                    }}
                >
                    <option value="">All Genres</option>
                    {genres.map((genre) => (
                        <option key={genre.id} value={genre.id}>
                            {genre.name}
                        </option>
                    ))}
                </select>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <div className="loading">Loading...</div>
            ) : (
                <div className="movies-grid">
                    {movies.map((movie) => (
                        <MovieCard movie={movie} key={movie.id} genreMap={genreMap} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default Home