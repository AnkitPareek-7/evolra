import React from 'react';

const PARTICLES = [0, 1, 2, 3, 4, 5, 6, 7];

export default function CelebrationBurst({ active, color }) {
  if (!active) return null;

  return (
    <span className="burst-layer" aria-hidden="true" style={{ '--burst-c': color }}>
      {PARTICLES.map((idx) => (
        <i key={idx} className="burst-particle" style={{ '--angle': `${idx * 45}deg` }} />
      ))}
    </span>
  );
}