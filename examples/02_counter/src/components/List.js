import React from 'react';

import { useStore, useStatus } from 'hookstore';

function List() {
  // const { pending } = useStatus('list/addItems');
  const [state, listActions] = useStore('list');
  const [{ count }, countActions] = useStore('count');
  console.log('[render List]');

  return (
    <>
      <RenderList state={state} actions={listActions} />
      <div>List use count: {count}</div>
      <button onClick={() => countActions.add(10)}>Add 10</button>
      <button onClick={() => countActions.asyncAdd(10)}>Async add 10</button>
    </>
  );
}

function List2() {
  const [state, listActions] = useStore('list');
  console.log('[render List2]');

  return (
    <>
      <RenderList state={state} actions={listActions} />
    </>
  );
}

function ListWithProps(props) {
  console.log('[render ListWithProps]');

  return <RenderList {...props} />;
}

const ListMemo = React.memo(props => {
  console.log('[render ListMemo]');

  return <RenderList {...props} />;
});

function RenderList({ state, actions }) {
  const addItemsStatus = useStatus('list/addItems');
  const addByCountStatus = useStatus('list/addByCount');
  const { list, loading } = state;
  const fetch = () => {
    if (addItemsStatus.pending || loading) return console.log('pls wait....');
    actions.addItems(5);
  };
  const fetchByCount = () => {
    if (addByCountStatus.pending || loading) return console.log('pls wait....');
    actions.addByCount();
  };

  return (
    <>
      <ul>{list && list.map((item, i) => <li key={i}>{item.name}</li>)}</ul>
      <button onClick={fetch}>Fetch list{addItemsStatus.pending ? '...' : ''}</button>
      <button onClick={fetchByCount}>
        Fetch list by count{addByCountStatus.pending ? '...' : ''}
      </button>
      <button onClick={actions.nothing}>nothing todo</button>
    </>
  );
}

export { List, List2, ListWithProps, ListMemo };
