import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Stack, Typography } from '@mui/material';
import { increment, decrement, reset } from './counterSlice';

export default function Counter() {
  const count = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <Stack spacing={2} alignItems="center" sx={{ mt: 4 }}>
      <Typography variant="h4">Counter: {count}</Typography>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={() => dispatch(increment())}>+</Button>
        <Button variant="contained" color="secondary" onClick={() => dispatch(decrement())}>-</Button>
        <Button variant="outlined" onClick={() => dispatch(reset())}>Reset</Button>
      </Stack>
    </Stack>
  );
}