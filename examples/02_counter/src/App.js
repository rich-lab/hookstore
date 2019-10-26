import React, { useMemo } from 'react';

// import { useStore, useStatus } from '@packages/hookstore';
import { useStore, useStatus } from 'hookstore';

import Counter from './components/Counter';
import { List, List2, ListWithProps, ListMemo } from './components/List';

function App() {
  const [{ nested, other }, commonActions] = useStore('common');
  // const { pending } = useStatus('list/addItems');
  // const [{ count }] = useStore('count');
  // const [{ list }, listActions] = useStore('list');
  // const ListMemo2 = useMemo(
  //   () => <ListWithProps list={list} actions={listActions} />,
  //   [list, listActions]
  // );
  console.log('[render App]');

  return (
    <>
      <h1>Counter demo</h1>
      <div>
        nested name:{nested.name} bar:{nested.foo.bar} level:{nested.foo.level} other:{other}
      </div>
      <button onClick={() => commonActions.setName(`name_${Date.now()}`)}>set name</button>
      <button onClick={() => commonActions.setLevel(nested.foo.level + 1)}>async set level</button>
      {/* <p>-------App--------</p>
      <div>App count: {count}</div> */}
      <p>-------Counter--------</p>
      <Counter />
      <p>-------List--------</p>
      <List />
      <p>-------List2--------</p>
      <List2 />
      {/* <p>--------memo-------</p> */}
      {/* <ListMemo list={list} actions={listActions} />
      <p>--------useMemo------</p>
      {ListMemo2} */}
    </>
  );
}

export default App;
