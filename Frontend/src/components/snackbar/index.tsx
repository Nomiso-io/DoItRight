import React from 'react';
import { Snackbar, IconButton, SnackbarContent } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

interface IProps {
  open: boolean;
  handleClose: any;
  message: string;
}

const SnackbarBottomLeft = (props: IProps) => {
  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      open={props.open && props.message !== ''}
      onClose={props.handleClose}
    >
      <SnackbarContent
        style={{
          backgroundColor: '#042E5B',
        }}
        action={
          <IconButton
            size='small'
            aria-label='close'
            color='inherit'
            onClick={props.handleClose}
          >
            <CloseIcon fontSize='small' />
          </IconButton>
        }
        message={props.message}
      />
    </Snackbar>
  );
};

export default SnackbarBottomLeft;
