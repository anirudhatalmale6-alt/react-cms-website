import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';
import { sliderAPI } from '../../api/endpoints';
import { getImageUrl } from '../../utils/helpers';

export default function HeroSlider() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sliderAPI.getPublished()
      .then((res) => setSlides(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || slides.length === 0) return null;

  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true,
    fade: true,
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <Slider {...settings}>
        {slides.map((slide) => (
          <div key={slide.id}>
            <div style={{
              position: 'relative',
              height: '70vh',
              minHeight: 400,
              maxHeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url(${getImageUrl(slide.image_url)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}>
              <div style={{
                textAlign: 'center',
                color: 'white',
                padding: '0 24px',
                maxWidth: 700,
                position: 'relative',
                zIndex: 1,
              }}>
                {slide.title && (
                  <h1 style={{
                    fontSize: 'clamp(1.75rem, 4vw, 3rem)',
                    fontWeight: 800,
                    marginBottom: 16,
                    color: 'white',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  }}>
                    {slide.title}
                  </h1>
                )}
                {slide.subtitle && (
                  <p style={{
                    fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                    marginBottom: 28,
                    opacity: 0.9,
                    lineHeight: 1.6,
                  }}>
                    {slide.subtitle}
                  </p>
                )}
                {slide.link_url && (
                  <Link to={slide.link_url} className="btn btn-primary btn-lg">
                    Learn More
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}
