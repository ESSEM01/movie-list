import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

type Actor = {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
};

type CastCarouselProps = {
    cast: Actor[];
};

const CastCarousel = ({ cast }: CastCarouselProps) => {
    return (
        <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={20}
            slidesPerView={4}
            navigation
            pagination={{ clickable: true }}
            breakpoints={{
                320: { slidesPerView: 1 },
                480: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
            }}
            className="cast-carousel"
        >
            {cast.map((actor) => (
                <SwiperSlide key={actor.id}>
                    <div className='cast-member'>
                        {actor.profile_path ? (
                            <img
                                src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                                alt={actor.name}
                            />
                        ) : (
                            <div className='cast-placeholder'>
                                No Image
                            </div>
                        )}
                        <p className='cast-name'>{actor.name}</p>
                        <p className='cast-character'>{actor.character}</p>
                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
    );
};

export default CastCarousel;
