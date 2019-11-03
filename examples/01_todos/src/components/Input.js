import React, { useState } from 'react';

import { useStatus, getStore } from 'hookstore';

export default () => {
  const [text, setText] = useState('');
  const addStatus = useStatus('todos/add');
  const [, actions] = getStore('todos');
  const addItem = async () => {
    if (addStatus.pending || !text) return;

    const ret = await actions.add(text);
    console.log('call add', ret);

    if (!addStatus.error) setText('');
  };

  return (
    <div className="input-box">
      <input value={text} onChange={e => setText(e.target.value)} />
      <button onClick={addItem}>{addStatus.pending ? 'wait...' : 'add'}</button>
    </div>
  );
};
