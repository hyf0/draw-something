import React, { useState, useCallback, ChangeEvent } from 'react';
import {
  Card,
  CardHeader,
  IconButton,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@material-ui/core';
import { MoreVert as MoreIcon } from '@material-ui/icons';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';

import { IReduxState } from '@client/store/reducers';
import FullScreenLoading from '@client/ui/FullScreenLoading';
import { userEffects } from '@client/store/effects';
import { IS_DEV_CLIENT } from '@client/util/constants';

import './index.scss';

const selectorAccountCard = ({ user: { user } }: IReduxState) => ({ user });

export default function AccountCard() {
  if (IS_DEV_CLIENT) {
    console.log('render AccountCard');
  }
  const { user } = useSelector(selectorAccountCard, shallowEqual);
  const [changedUsername, setChangedUsername] = useState(
    user != null ? user.username : '',
  );
  const updateUsername = useCallback(
    (evt: ChangeEvent<HTMLInputElement>) =>
      setChangedUsername(evt.target.value.trim()),
    [setChangedUsername],
  );

  // -- 更改用户名相关逻辑
  const [isShowChangeNameDialog, setIsShowChangeNameDialog] = useState(false);
  const dispatch = useDispatch();
  const openChangeNameModal = useCallback(() => setIsShowChangeNameDialog(true), [
    setIsShowChangeNameDialog,
  ]);
  const closeChangeName = useCallback(() => setIsShowChangeNameDialog(false), [
    setIsShowChangeNameDialog,
  ]);
  const confirmChangeUsername = useCallback(() => {
    const isEmptyName = changedUsername.trim().length === 0;
    if (user != null && !isEmptyName && user.username !== changedUsername) {
      // 只有名字不为空，且前后发生变化, 才发送请求
      dispatch(userEffects.changeUsername(changedUsername));
    }
    if (!isEmptyName) closeChangeName();
  }, [user, changedUsername, dispatch, closeChangeName]);

  if (user == null) return <FullScreenLoading />;

  return (
    <>
      <Dialog open={isShowChangeNameDialog} onClose={closeChangeName}>
        <DialogTitle>更改用户名</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="text"
            placeholder="用户名"
            value={changedUsername}
            onChange={updateUsername}
          />
        </DialogContent>
        <DialogActions>
          <Button disabled={changedUsername.trim().length === 0} onClick={confirmChangeUsername}>确定</Button>
          <Button onClick={closeChangeName}>取消</Button>
        </DialogActions>
      </Dialog>
      <div className="user-info">
        <Card>
          <CardHeader
            title={`你好，${user.username}！`}
            subheader={`登陆于${new Date().toLocaleTimeString()}`}
            avatar={<Avatar>{user.username[0]}</Avatar>}
            action={
              <IconButton onClick={openChangeNameModal}>
                <MoreIcon />
              </IconButton>
            }
          ></CardHeader>
        </Card>
      </div>
    </>
  );
}
