import { useState } from "react";

type CarouselProps = {
    children: React.ReactNode[];
    itemsPerPage?: number;
};

const Carousel = ({ children, itemsPerPage = 4 }: CarouselProps) => {
    const [index, setIndex] = useState(0);
    const maxIndex = Math.max(0, children.length - itemsPerPage);

    const handlePrevious = () => {
        setIndex(prev => Math.max(0, prev - 1));
    };

    const handleNext = () => {
        setIndex(prev => Math.min(maxIndex, prev + 1));
    };

    // Calcola lo spostamento in percentuale
    const translateX = -(index * (100 / itemsPerPage));

    return (
        <div className="carousel-container">
            <button
                className="carousel-btn prev"
                onClick={handlePrevious}
                aria-label="Previous"
                disabled={index === 0}
            >
                ‹
            </button>

            <div className="carousel-viewport">
                <div
                    className="carousel-track"
                    style={{ transform: `translateX(${translateX}%)` }}
                >
                    {children.map((child, i) => (
                        <div
                            key={i}
                            className="carousel-item"
                            style={{ flex: `0 0 ${100 / itemsPerPage}%` }}
                        >
                            {child}
                        </div>
                    ))}
                </div>
            </div>

            <button
                className="carousel-btn next"
                onClick={handleNext}
                aria-label="Next"
                disabled={index >= maxIndex}
            >
                ›
            </button>
        </div>
    );
};

export default Carousel;