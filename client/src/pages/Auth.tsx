import { useState } from "react"
import { login, register } from "../services/api"
import { useNavigate } from "react-router-dom"
import { useMovieContext } from "../contexts/useMovieContext"
import "../css/Auth.css"

function Auth() {
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [fullName, setFullName] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const { setUser } = useMovieContext()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            let data
            if (isLogin) {
                data = await login(email, password)
            } else {
                data = await register(email, password, fullName)
            }
            
            setUser(data.user) // Update context
            navigate("/") // Navigate without reload
        } catch (err) {
            setError(err instanceof Error ? err.message : "Authentication failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>{isLogin ? "Login" : "Register"}</h2>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="fullName">Full Name</label>
                            <input
                                type="text"
                                id="fullName"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="John Doe"
                            />
                        </div>
                    )}
                    
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="email@example.com"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            minLength={6}
                        />
                    </div>
                    
                    <button type="submit" disabled={loading} className="submit-btn">
                        {loading ? "Loading..." : isLogin ? "Login" : "Register"}
                    </button>
                </form>
                
                <p className="toggle-auth">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button 
                        type="button" 
                        onClick={() => {
                            setIsLogin(!isLogin)
                            setError(null)
                        }}
                        className="toggle-btn"
                    >
                        {isLogin ? "Register" : "Login"}
                    </button>
                </p>
            </div>
        </div>
    )
}

export default Auth
