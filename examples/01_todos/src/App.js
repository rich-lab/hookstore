import React, { useState } from 'react';

import Input from './components/Input';
import List from './components/List';
import Filter from './components/Filter';

export default props => {
  const [status, setStatus] = useState(null);

  return (
    <>
      <Input />
      <List status={status} />
      <Filter setStatus={setStatus} />
    </>
  );
};
