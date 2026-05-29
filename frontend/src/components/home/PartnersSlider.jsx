import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import { partnersAPI } from '../../api/endpoints';
import { getImageUrl } from '../../utils/helpers';

export default function PartnersSlider() {
  const [partners, setPartners] = useState([]);

  useEffect(() => {
    partnersAPI.getAll()
      .then((res) => setPartners(res.data || []))
      .catch(() => {});
  }, []);

  if (partners.length === 0) return null;

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: Math.min(partners.length, 6),
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: Math.min(partners.length, 4) } },
      { breakpoint: 768, settings: { slidesToShow: Math.min(partners.length, 3) } },
      { breakpoint: 480, settings: { slidesToShow: Math.min(partners.length, 2) } },
    ],
  };

  return (
    <section className="section" style={{ backgroundColor: 'var(--color-bg-alt)' }}>
      <div className="container">
        <div className="section-title">
          <h2>Our Partners</h2>
          <p>Trusted by leading organizations</p>
        </div>
        <Slider {...settings}>
          {partners.map((partner) => (
            <div key={partner.id} style={{ padding: '0 16px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 80,
                padding: '0 20px',
              }}>
                {partner.url ? (
                  <a href={partner.url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={getImageUrl(partner.logo_url || partner.logo)}
                      alt={partner.name}
                      style={{ maxHeight: 60, maxWidth: '100%', objectFit: 'contain', opacity: 0.7, transition: 'opacity 0.2s' }}
                      onMouseEnter={(e) => e.target.style.opacity = '1'}
                      onMouseLeave={(e) => e.target.style.opacity = '0.7'}
                    />
                  </a>
                ) : (
                  <img
                    src={getImageUrl(partner.logo_url || partner.logo)}
                    alt={partner.name}
                    style={{ maxHeight: 60, maxWidth: '100%', objectFit: 'contain', opacity: 0.7 }}
                  />
                )}
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
}
