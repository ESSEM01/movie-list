const BACKEND_URL = import.meta.env.VITE_API_URL;
// TMDB passa dal server: la chiave non arriva mai al browser
const TMDB_URL = `${BACKEND_URL}/tmdb`;

// Helper for authenticated requests to backend
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    const response = await fetch(url, { 
        ...options, 
        headers,
        credentials: 'include' // Include session cookies
    });

    if (response.status === 401) {
        // Session expired - redirect to login
        window.location.href = '/login';
    }

    return response;
};

// Il server risponde con { message } oppure, per validazione e rate limit, { errors: [{ message }] }
const errorMessage = (data: any, fallback: string): string =>
    data?.message ?? data?.errors?.[0]?.message ?? fallback;

// TMDB API calls (tramite il server)
const tmdbGet = async (path: string) => {
    const response = await fetchWithAuth(`${TMDB_URL}${path}`);
    const data = await response.json();
    if (!response.ok) throw new Error(errorMessage(data, 'Failed to load movies'));
    return data;
};

export const getPopularMovies = async () => {
    const data = await tmdbGet('/movies/popular');
    return data.results;
};

export const searchMovies = async (query: string) => {
    const data = await tmdbGet(`/search?query=${encodeURIComponent(query)}`);
    return data.results;
};

export const getMovieDetails = async (movieId: number) => {
    return tmdbGet(`/movies/${movieId}`);
};

// Backend API calls - Auth
export const register = async (email: string, password: string, fullName?: string) => {
    const response = await fetch(`${BACKEND_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, fullName }),
    });
    const data = await response.json();

    if (!response.ok) throw new Error(errorMessage(data, 'Registration failed'));

    return data;
};

export const login = async (email: string, password: string) => {
    const response = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
    });
    const data = await response.json();

    if (!response.ok) throw new Error(errorMessage(data, 'Login failed'));

    return data;
};

export const logout = async () => {
    await fetchWithAuth(`${BACKEND_URL}/auth/logout`, { method: 'POST' });
};

export const getCurrentUser = async () => {
    try {
        // Don't use fetchWithAuth here - 401 is expected when not logged in
        const response = await fetch(`${BACKEND_URL}/auth/me`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
        });
        
        if (!response.ok) {
            if (response.status === 401) return null;
            const data = await response.json();
            throw new Error(errorMessage(data, 'Failed to get user'));
        }

        const data = await response.json();
        return data.user;
    } catch (error) {
        // Network error or server not available
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            // Silently return null when server is not reachable
            return null;
        }
        throw error;
    }
};

// Backend API calls - Favorites
export const getFavorites = async () => {
    const response = await fetchWithAuth(`${BACKEND_URL}/favorites`);
    const data = await response.json();

    if (!response.ok) throw new Error(errorMessage(data, 'Failed to fetch favorites'));

    return data.favorites;
};

export const addFavorite = async (movie: { id: number; title: string; release_date: string; poster_path?: string }) => {
    const response = await fetchWithAuth(`${BACKEND_URL}/favorites`, {
        method: 'POST',
        body: JSON.stringify(movie),
    });
    const data = await response.json();

    if (!response.ok) throw new Error(errorMessage(data, 'Failed to add favorite'));

    return data.favorite;
};

export const removeFavorite = async (movieId: number) => {
    const response = await fetchWithAuth(`${BACKEND_URL}/favorites/${movieId}`, {
        method: 'DELETE',
    });
    const data = await response.json();

    if (!response.ok) throw new Error(errorMessage(data, 'Failed to remove favorite'));

    return data;
};

export const getReviews = async (movieId: number) => {
    const response = await fetchWithAuth(`${BACKEND_URL}/reviews/${movieId}`);
    const data = await response.json();

    if (!response.ok) throw new Error(errorMessage(data, 'Failed to fetch reviews'));

    return data.reviews;
}

export const addReview = async (movieId: number, content: string, rating: number) => {
    const response = await fetchWithAuth(`${BACKEND_URL}/reviews`, {
        method: 'POST',
        body: JSON.stringify({ movieId, content, rating }),
    });
    const data = await response.json();

    if (!response.ok) throw new Error(errorMessage(data, 'Failed to add review'));

    return data.review;
}

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
    try {
        const user = await getCurrentUser();
        return user !== null;
    } catch {
        return false;
    }
};

// Get genres
export const getGenres = async () => {
    const data = await tmdbGet('/genres');
    return data.genres;
}

// Discover movies by genre
export const discoverMoviesByGenre = async (genreId: number) => {
    const data = await tmdbGet(`/genres/${genreId}/movies`);
    return data.results;
}

