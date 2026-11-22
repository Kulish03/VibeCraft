import React from 'react';
import { motion } from 'framer-motion';

const SkeletonLoader = ({ count = 3, height = '20px', className = '' }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }} className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
          style={{
            height,
            width: i === count - 1 && count > 1 ? '70%' : '100%',
            backgroundColor: '#E2E8F0',
            borderRadius: 'var(--radius-sm)',
            backgroundImage: 'linear-gradient(90deg, #E2E8F0 0%, #F1F5F9 50%, #E2E8F0 100%)',
            backgroundSize: '200% 100%',
          }}
        />
      ))}
    </div>
  );
};

export default SkeletonLoader;
