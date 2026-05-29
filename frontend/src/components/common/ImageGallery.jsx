import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import { getImageUrl } from '../../utils/helpers';

export default function ImageGallery({ images = [] }) {
  const [lightbox, setLightbox] = useState(null);

  if (!images || images.length === 0) return null;

  const openLightbox = (index) => setLightbox(index);
  const closeLightbox = () => setLightbox(null);

  const goPrev = () => setLightbox((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const goNext = () => setLightbox((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  return (
    <>
      <div style={{
        display: 'grid',
        gridTemplateColumns: images.length === 1 ? '1fr' : 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 12,
      }}>
        {images.map((img, idx) => (
          <div
            key={img.id || idx}
            style={{ cursor: 'pointer', borderRadius: 8, overflow: 'hidden' }}
            onClick={() => openLightbox(idx)}
          >
            <img
              src={getImageUrl(img.image_url)}
              alt={img.caption || `Image ${idx + 1}`}
              style={{ width: '100%', height: 180, objectFit: 'cover' }}
            />
            {img.caption && (
              <p style={{ padding: '8px 0', fontSize: '0.8125rem', color: 'var(--color-text-light)' }}>
                {img.caption}
              </p>
            )}
          </div>
        ))}
      </div>

      {lightbox !== null && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={closeLightbox}
        >
          <button onClick={(e) => { e.stopPropagation(); closeLightbox(); }} style={{
            position: 'absolute', top: 20, right: 20, background: 'none', border: 'none',
            color: 'white', fontSize: '1.5rem', cursor: 'pointer',
          }}><FiX /></button>

          {images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); goPrev(); }} style={{
                position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white',
                padding: '12px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.25rem',
              }}><FiChevronLeft /></button>
              <button onClick={(e) => { e.stopPropagation(); goNext(); }} style={{
                position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white',
                padding: '12px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.25rem',
              }}><FiChevronRight /></button>
            </>
          )}

          <img
            src={getImageUrl(images[lightbox].image_url)}
            alt={images[lightbox].caption || ''}
            style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 8 }}
            onClick={(e) => e.stopPropagation()}
          />

          {images[lightbox].caption && (
            <p style={{
              position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
              color: 'white', fontSize: '0.9375rem', textAlign: 'center', maxWidth: '80vw',
            }}>{images[lightbox].caption}</p>
          )}
        </div>
      )}
    </>
  );
}
