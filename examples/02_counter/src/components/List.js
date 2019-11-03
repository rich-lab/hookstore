import React from 'react';

import { useStore, useStatus } from 'hookstore';

function List() {
  const [state, listActions] = useStore('list');
  console.log('[render List]');

  return (
    <>
      <RenderList state={state} actions={listActions} comp="list2" />
    </>
  );
}

function ListWithCount() {
  // const { pending } = useStatus('list/addItems');
  const [state, listActions] = useStore('list');
  const [count, countActions] = useStore('count', s => s.count);
  console.log('[render ListWithCount]', count);

  return (
    <>
      <RenderList state={state} actions={listActions} comp="list" />
      <div style={{ marginTop: 10 }} />
      <span>Read count: {count}</span>
      <button style={{ margin: '0 10px' }} onClick={() => countActions.add(10)}>
        Add add count(10)
      </button>
      <button onClick={() => countActions.asyncAdd(10)}>Async add count(10)</button>
    </>
  );
}

const ListMemo = React.memo(props => {
  console.log('[render ListMemo]');

  return <RenderList {...props} />;
});

function ListWithProps(props) {
  console.log('[render ListWithProps]');

  return <RenderList {...props} />;
}

function RenderList({ state, actions }) {
  const { pending: addItemsing } = useStatus('list/addItems');
  const { pending: addByCounting } = useStatus('list/addByCount');
  const { list } = state;
  const fetch = () => {
    if (addItemsing) return console.log('pls wait....');
    actions.addItems(5);
  };
  const fetchByCount = () => {
    if (addByCounting) return console.log('pls wait....');
    actions.addByCount();
  };

  return (
    <>
      <ul>{list && list.map((item, i) => <li key={i}>{item.name}</li>)}</ul>
      <button onClick={fetch}>Fetch list</button>
      <button onClick={fetchByCount}>Fetch list by count{addByCounting ? '...' : ''}</button>
      <button onClick={actions.nothing}>nothing todo</button>
    </>
  );
}

export { List, ListWithCount, ListMemo, ListWithProps };
