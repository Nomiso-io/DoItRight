import React from 'react';
import { Modal, Button, makeStyles } from '@material-ui/core';
import { buttonStyle } from '../../common/common';
import { Text } from '../../common/Language';

interface IModal {
  message: string;
  icon?: any;
  openModal: boolean;
  handleModalButtonClicked: any;
}

const useStyles = makeStyles((theme) => ({
  paper: {
    width: 'auto',
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '0px',
  },
  alertButton1: {
    ...buttonStyle,
    // marginLeft: '55%',
    marginTop: '8px',
  },
  icon: {
    marginTop: '10px',
    marginRight: '5px',
  },
  buttonContainer: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

export const ModalComponentInfo = (props: IModal) => {
  const classes = useStyles();
  return (
    <Modal aria-describedby='simple-modal-description' open={props.openModal}>
      <div className={classes.modalContainer}>
        <div className={classes.paper}>
          <div style={{ display: 'flex' }}>
            <div className={classes.icon}>{props.icon}</div>
            <h6 id='simple-modal-description'>{props.message}</h6>
          </div>
          <div className={classes.buttonContainer}>
            <Button
              variant='outlined'
              className={classes.alertButton1}
              onClick={props.handleModalButtonClicked}
              size='small'
            >
              <Text tid='ok' />
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
