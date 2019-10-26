import React from 'react';

import { useStore } from 'hookstore';

export default function Counter() {
  const [state, actions] = useStore('count');
  const { count } = state;
  console.log('[render counter]');

  return (
    <>
      <div>counter count: {count}</div>
      <button onClick={() => actions.add(1)}>Add 1</button>
      <button onClick={() => actions.addx(1)}>Addx 1</button>
      <button onClick={() => actions.asyncAdd(1)}>Async add 1</button>
      <button onClick={actions.printCountAsync}>print count async</button>
      <button onClick={() => actions.nothing(1)}>nothing todo</button>
    </>
  );
}
