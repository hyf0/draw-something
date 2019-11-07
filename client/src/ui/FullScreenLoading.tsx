import React from 'react';

import { CircularProgress } from '@material-ui/core';

export default function FullScreenLoading() {

  return (
    <div className="full-screen-loading" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <CircularProgress />
    </div>
  );
}
