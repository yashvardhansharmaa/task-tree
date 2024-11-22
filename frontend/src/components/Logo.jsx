import React from 'react';
import { Group, Title } from '@mantine/core';

const Logo = ({ size = 'md', showText = true }) => {
  const logoSize = {
    sm: 24,
    md: 32,
    lg: 48
  }[size];

  return (
    <Group spacing="xs" align="center">
      <img 
        src="/logo-tasktree.webp" 
        alt="TaskTree Logo" 
        style={{ 
          height: logoSize,
          width: 'auto',
          objectFit: 'contain'
        }} 
      />
      {showText && (
        <Title 
          order={size === 'sm' ? 3 : 2} 
          style={{ 
            color: '#228BE6',
            margin: 0,
            fontSize: size === 'sm' ? '1.2rem' : size === 'md' ? '1.5rem' : '2rem'
          }}
        >
          TaskTree
        </Title>
      )}
    </Group>
  );
};

export default Logo; 