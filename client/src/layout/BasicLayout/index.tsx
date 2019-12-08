import './index.scss';

import NotificationPanel from '@/component/NotificationPanel';
import React from 'react';

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
