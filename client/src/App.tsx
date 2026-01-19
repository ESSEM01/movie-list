import './css/App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Favorite from './pages/Favorites'
import Auth from './pages/Auth'
import MovieDetails from './pages/MovieDetails'
import { MovieProvider } from './contexts/MovieContext'
import { useMovieContext } from './contexts/useMovieContext'
import NavBar from './components/header/NavBar'

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useMovieContext()
  
  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

// Redirect to home if already authenticated
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useMovieContext()
  
  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
  }
  
  if (user) {
    return <Navigate to="/" replace />
  }
  
  return <>{children}</>
}

function AppRoutes() {
  return (
    <>
      <NavBar />
      <main className='main-content'>
        <Routes>
          <Route 
            path='/' 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route 
            path='/login' 
            element={
              <AuthRoute>
                <Auth />
              </AuthRoute>
            } 
          />
          <Route 
            path='/movie/:id' 
            element={
              <ProtectedRoute>
                <MovieDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path='/favorites' 
            element={
              <ProtectedRoute>
                <Favorite />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
    </>
  )
}

function App() {
  return (
    <MovieProvider>
      <AppRoutes />
    </MovieProvider>
  )
}

export default App
