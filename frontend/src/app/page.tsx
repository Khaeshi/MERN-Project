'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react';

const heroImage = 'https://images.unsplash.com/photo-1616547092703-79f311f472ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBzaG9wJTIwYmFyaXN0YXxlbnwxfHx8fDE3Njg3ODM3NTl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral';

const productImages = [
  'https://images.unsplash.com/photo-1601369040089-0024001cce2e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBjdXAlMjB0YWJsZXxlbnwxfHx8fDE3Njg2ODE3OTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  'https://images.unsplash.com/photo-1669162364316-a74b2d661d1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXR0ZSUyMGFydCUyMGNvZmZlZXxlbnwxfHx8fDE3Njg3NjczNjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  'https://images.unsplash.com/photo-1582572426223-d152057ba012?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlc3ByZXNzbyUyMG1hY2hpbmV8ZW58MXx8fHwxNzY4NzgzNzYwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  'https://images.unsplash.com/photo-1577599905863-a8c4f7f2b60b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBiZWFucyUyMGNhZmV8ZW58MXx8fHwxNzY4NzgzNzYwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  'https://images.unsplash.com/photo-1708430651927-20e2e1f1e8f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXBwdWNjaW5vJTIwY29mZmVlfGVufDF8fHx8MTc2ODc3OTE0OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  'https://images.unsplash.com/photo-1616547092703-79f311f472ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBzaG9wJTIwYmFyaXN0YXxlbnwxfHx8fDE3Njg3ODM3NTl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
];

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  // Add other properties if needed
}

export default function Home() {
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/test/users'); // Adjust path if different
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        console.log('Fetched users:', data); // Log to console
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    fetchUsers();
  }, []); // Runs once on mount

  return (
    <>
      {/* Hero Section */}
      <section id="home" className="relative h-[500px] md:h-[600px] flex items-center justify-center text-center">
        <div className="absolute inset-0">
          <Image 
            src={heroImage} 
            alt="Coffee shop barista" 
            width={500}
            height={500}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="relative z-10 px-4">
          <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-bold mb-8 tracking-wide">
            DISCOVER THE<br />PERFECT BLEND
          </h1>
          <button className="bg-[#8B6F47] hover:bg-[#75593a] text-white px-8 md:px-12 py-3 md:py-4 text-base md:text-lg transition-colors shadow-lg">
            Order Now
          </button>
        </div>
      </section>

      {/* Featured Products */}
      <section id="menu" className="py-12 md:py-16 px-4 md:px-6 bg-gray-50">
        <h2 className="text-center text-3xl md:text-4xl font-bold mb-8 md:mb-12 tracking-wide">
          FEATURED PRODUCTS
        </h2>
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {productImages.map((image, index) => (
            <div key={index} className="aspect-square overflow-hidden rounded-lg shadow-md">
              <Image 
                src={image} 
                alt={`Featured product ${index + 1}`}
                width={500}
                height={500}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 md:py-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-wide">
            ABOUT CAFE PRINCE
          </h2>
          <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-6">
            At Cafe Prince, we believe in serving only the finest coffee, crafted with passion and expertise. 
            Our baristas are dedicated to creating the perfect cup every time, using premium beans sourced 
            from the best coffee regions around the world.
          </p>
          <p className="text-base md:text-lg text-gray-700 leading-relaxed">
            Whether you&#39;re looking for a quick espresso or a relaxing place to enjoy a latte, 
            Cafe Prince offers a welcoming atmosphere where coffee lovers can gather and savor 
            exceptional brews.
          </p> {/* &#39; numeric character reference */ }
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 md:py-16 px-4 md:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 tracking-wide">
            VISIT US
          </h2>
          <div className="space-y-4 text-base md:text-lg text-gray-700">
            <p>
              <span className="font-semibold">Address:</span><br />
              Black 21 Lot 4 Italy St. EP Housing<br />
              Brgy Pinagsama Phase 2, Taguig, Philippines
            </p>
            <p>
              <span className="font-semibold">Phone:</span><br />
              0915-895-6883
            </p>
            <p>
              <span className="font-semibold">Email:</span><br />
              cafeprince@gmail.com
            </p>
            <p className="pt-4 text-sm text-gray-600">
              Open Daily: 7:00 AM - 10:00 PM
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
