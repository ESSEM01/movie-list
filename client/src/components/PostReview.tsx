import { useState } from 'react'
import { addReview } from '../services/api'
import Rating from './form/Rating'
import TextArea from './form/Textarea'

type PostReviewProps = {
    movieId: number
    onReviewSubmitted: () => void
}

const PostReview = ({ movieId, onReviewSubmitted }: PostReviewProps) => {
    const [reviewRating, setReviewRating] = useState(0)
    const [reviewText, setReviewText] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault()
        if (reviewRating === 0 || !reviewText.trim()) return

        setSubmitting(true)
        try {
            await addReview(movieId, reviewText, reviewRating)

            // Resetta il form
            setReviewRating(0)
            setReviewText('')

            // Notifica il parent per ricaricare le recensioni
            onReviewSubmitted()

            alert('Recensione inviata con successo!')
        } catch (err) {
            console.error('Failed to submit review:', err)
            alert(err instanceof Error ? err.message : 'Errore nell\'invio della recensione')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="review-section">
            <h2>Lascia una Recensione</h2>
            <form onSubmit={handleSubmitReview}>
                <Rating value={reviewRating} onChange={setReviewRating} />
                <TextArea
                    value={reviewText}
                    placeholder="Scrivi la tua recensione..."
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={5}
                    maxLength={2000}
                />

                <button
                    type="submit"
                    className="submit-review-btn"
                    disabled={submitting || reviewRating === 0 || !reviewText.trim()}
                >
                    {submitting ? 'Invio...' : 'Invia Recensione'}
                </button>
            </form>
        </div>
    )
}

export default PostReview