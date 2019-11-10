import React, { useCallback } from 'react';
import { Snackbar, IconButton } from '@material-ui/core';
import { Close as CloseIcon } from '@material-ui/icons';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import { IReduxState } from '@src/store/reducers';
import { globalActions } from '@src/store/actions';

const selectorNotificationPanel = ({ global: { notifications } }: IReduxState) => ({
  notifications,
});

// let isClosing = false; // 因为本例是单例组件，所以我把这个变量写在外面了，如果要复用的，需要用useRef存储这个变量
const NotificationPanel = React.memo(function NotificationPanel() {
  const { notifications } = useSelector(selectorNotificationPanel, shallowEqual);

  const dispatch = useDispatch();

  const shiftNotification = useCallback(() => {
    dispatch(globalActions.createShiftNotification());
  }, [dispatch]);


  return (
    <>
    {notifications.map(n => (
      <Snackbar
      key={n.id}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      // key={`${vertical},${horizontal}`}
      open={true}
      onClose={shiftNotification}
      autoHideDuration={4000}
      action={
        <IconButton onClick={shiftNotification} key="close" aria-label="close" color="inherit">
          <CloseIcon />
        </IconButton>
      }
      message={<span>{n.detail == null ? n.title : `${n.title}-${n.detail}`}</span>}
    />
    ))}
    </>
  );
});

export default NotificationPanel;
