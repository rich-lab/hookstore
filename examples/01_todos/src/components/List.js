import React from 'react';

import { useStore } from 'hookstore';

import Item from './Item';

export default ({ status }) => {
  const [{ list }] = useStore('todos');
  const showList = status !== null ? list.filter(item => item.status === status) : list;

  return (
    <ul>
      {showList.map(item => (
        <Item key={item.id} {...item} />
      ))}
    </ul>
  );
};
