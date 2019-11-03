import React from 'react';

// import { useStore, useStatus } from '@packages/hookstore';
import { useStore, useStatus } from 'hookstore';

import Counter from './components/Counter';
import { List, ListWithCount } from './components/List';

function App() {
  const [{ nested, other }, commonActions] = useStore('common', s => {
    return { nested: s.nested, other: s.other };
  });
  const { pending: setLeveling } = useStatus('common/setLevel');
  const { pending: addItemsing } = useStatus('list/addItems');
  // const { nested, other } = state;
  console.log('[render App]');

  return (
    <>
      <h1>Counter demo</h1>
      <p>-------common state--------</p>
      <div>
        nested name:{nested.name} bar:{nested.foo.bar} level:{nested.foo.level} other:{other}
      </div>
      <button onClick={() => commonActions.setName(`name-${Date.now()}`)}>set name</button>
      <button onClick={() => commonActions.setLevel(nested.foo.level + 1)}>
        async set level{setLeveling ? '...' : ''}
      </button>
      <p>-------Counter--------</p>
      <Counter />
      <p>-------listen action status--------</p>
      <div style={{ color: '#DE0000' }}>
        List loading status: {addItemsing ? 'pending...' : 'false'}
      </div>
      <p>-------List--------</p>
      <List />
      <p>-------ListWithCount--------</p>
      <ListWithCount />
      {/* <p>--------memo-------</p> */}
      {/* <ListMemo list={list} actions={listActions} />
      <p>--------useMemo------</p>
      {ListMemo2} */}
    </>
  );
}

export default App;
