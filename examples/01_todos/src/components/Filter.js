import React from 'react';

export default ({ setStatus }) => {
  return (
    <div>
      <button onClick={() => setStatus(null)}>all</button>
      <button onClick={() => setStatus(1)}>done</button>
      <button onClick={() => setStatus(0)}>undo</button>
    </div>
  );
};
