type RatingProps = {
    value: number
    onChange: (rating: number) => void
    maxStars?: number
}

const Rating = ({ value, onChange, maxStars = 5 }: RatingProps) => {
    return (
        <div className="rating-input">
            <label>Voto:</label>
            <div className="stars">
                {Array.from({ length: maxStars }, (_, i) => i + 1).map((star) => (
                    <button
                        key={star}
                        type="button"
                        className={`star-btn ${value >= star ? 'active' : ''}`}
                        onClick={() => onChange(star)}
                    >
                        ★
                    </button>
                ))}
            </div>
        </div>
    )
}

export default Rating