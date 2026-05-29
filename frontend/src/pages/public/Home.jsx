import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import SEOHead from '../../components/common/SEOHead';
import HeroSlider from '../../components/home/HeroSlider';
import FeaturedServices from '../../components/home/FeaturedServices';
import FeaturedProjects from '../../components/home/FeaturedProjects';
import PartnersSlider from '../../components/home/PartnersSlider';

export default function Home() {
  return (
    <>
      <SEOHead title="Home" description="Welcome to our website. We provide professional services and solutions." />

      <HeroSlider />

      <FeaturedServices />

      <section style={{
        padding: '80px 0',
        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
        color: 'white',
        textAlign: 'center',
      }}>
        <div className="container">
          <h2 style={{ color: 'white', fontSize: '2rem', marginBottom: 16 }}>
            Ready to Get Started?
          </h2>
          <p style={{ fontSize: '1.125rem', opacity: 0.9, marginBottom: 32, maxWidth: 600, margin: '0 auto 32px' }}>
            Contact us today to discuss your project needs. We would love to help you achieve your goals.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/quotation" className="btn btn-lg" style={{ backgroundColor: 'white', color: 'var(--color-primary)', fontWeight: 700 }}>
              Get a Quote <FiArrowRight style={{ marginLeft: 6 }} />
            </Link>
            <Link to="/contact" className="btn btn-lg" style={{ backgroundColor: 'transparent', color: 'white', border: '2px solid white' }}>
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <FeaturedProjects />

      <PartnersSlider />
    </>
  );
}
