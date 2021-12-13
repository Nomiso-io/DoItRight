import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import { Text } from '../../common/Language';

export const IdleTimeOutModal = (props: any) => {

  return (
    <Dialog
      open={props.openDialog}
      onClose={props.handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title"><Text tid='youWillGetTimedOutYouWantToStay' /></DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          <Text tid='idleTimeoutDescription' />
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.handleLogout} color="primary">
          <Text tid='logout' />
        </Button>
        <Button onClick={props.handleClose} color="primary">
          <Text tid='stay' />
        </Button>
      </DialogActions>
    </Dialog>
  );
};
