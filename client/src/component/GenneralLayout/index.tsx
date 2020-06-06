import React from 'react';

import './index.scss';


export default function GenneralLayout(props: {children: any}) {
  const { children } = props;
  return (
    <div className="genneral-layout">
      {children}
    </div>
  )
}

GenneralLayout.Header = function GenneralLayoutHeader(props: {children: any}) {

  return (
    <header className="genneral-layout-header">
      {props.children}
    </header>
  );
}

GenneralLayout.Content = function GenneralLayoutContent(props: {children: any}) {
  return (
    <div className="genneral-layout-content">
      {props.children}
    </div>
  );
}

GenneralLayout.Footer = function GenneralLayoutFooter(props: {children: any}) {
  return (
    <footer className="genneral-layout-footer">
      {props.children}
    </footer>
  );
}
