import React from 'react';

import './index.scss';
import NotificationPanel from '@src/component/NotificationPanel';

export default function BasicLayout({ children }: { children : any}) {
    return (
      <>
        <div className="basic-layout">
            {children}
        </div>
        <NotificationPanel />
      </>
    );
}
