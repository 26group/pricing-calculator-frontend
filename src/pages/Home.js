import React from 'react';
import { Typography, Container } from '@mui/material';
import Counter from '../features/counter/Counter';

export default function Home() {
  return (
    <Container>
      <Typography variant="h3" sx={{ mt: 4 }}>Home Page</Typography>
      <Counter />
    </Container>
  );
}