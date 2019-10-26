import React from 'react';

// import { useStore, useStatus } from '@packages/hookstore';
import { useStore, useStatus } from 'hookstore';

import Counter from './components/Counter';
import { List, List2 } from './components/List';

function App() {
  const [{ nested, other }, actions] = useStore('common');
  const { pending } = useStatus('common/setLevel');
  console.log('[render App]');

  return (
    <>
      <h1>Counter demo</h1>
      <div>
        nested name:{nested.name} bar:{nested.foo.bar} level:{nested.foo.level} other:{other}
      </div>
      <button onClick={() => actions.setName(`name_${Date.now()}`)}>set name</button>
      <button onClick={() => actions.setLevel(nested.foo.level + 1)}>
        async set level{pending ? '...' : ''}
      </button>
      <p>---Counter---</p>
      <Counter />
      <p>---List---</p>
      <List />
      <p>---List2---</p>
      <List2 />
    </>
  );
}

export default App;
