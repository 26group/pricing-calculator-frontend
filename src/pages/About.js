import React from 'react';
import { Typography, Container } from '@mui/material';

export default function About() {
  return (
    <Container>
      <Typography variant="h3" sx={{ mt: 4 }}>About Page</Typography>
      <Typography>Welcome to the pricing calculator demo app with Auth0 integration.</Typography>
    </Container>
  );
}