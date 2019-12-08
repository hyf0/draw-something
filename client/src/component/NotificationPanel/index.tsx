import { IconButton, Snackbar } from '@material-ui/core';
import { Close as CloseIcon } from '@material-ui/icons';
import { globalActions } from '@/store/actions';
import { IReduxState } from '@/store/reducers';
import React, { useCallback } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

const selectorNotificationPanel = ({ global: { notifications } }: IReduxState) => ({
  notifications,
});

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
