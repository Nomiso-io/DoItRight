import React from 'react';
import { Typography, Modal, Button, makeStyles } from '@material-ui/core';
import { buttonStyle } from '../../common/common';
import { Text } from '../../common/Language';

interface IModal {
  message: string;
  messageSecondary?: string;
  icon?: any;
  openModal: boolean;
  handleModalYesClicked: any;
  handleModalNoClicked: any;
}

const useStyles = makeStyles((theme) => ({
  paper: {
    width: 400,
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
    marginLeft: '55%',
    marginTop: '8px',
  },
  alertButton2: {
    ...buttonStyle,
    marginLeft: '10px',
    marginTop: '8px',
  },
  icon: {
    marginTop: '10px',
    marginRight: '5px',
  },
  secondaryMessage: {
    fontSize: '10px',
    marginBottom: '10px',
  },
}));

export const ModalComponent = (props: IModal) => {
  const classes = useStyles();
  let message = <Text tid={props.message} />;
  let messageSecondary = <Text tid={props.messageSecondary} />;

  return (
    <Modal aria-describedby='simple-modal-description' open={props.openModal}>
      <div className={classes.modalContainer}>
        <div className={classes.paper}>
          <div style={{ display: 'flex' }}>
            {props.icon && <div className={classes.icon}>{props.icon}</div>}
            <h6 id='simple-modal-description'>{message}</h6>
          </div>
          {props.messageSecondary && (
            <div className={classes.secondaryMessage}>
              <Typography color='textSecondary'>{messageSecondary}</Typography>
            </div>
          )}
          <Button
            variant='outlined'
            className={classes.alertButton1}
            onClick={props.handleModalYesClicked}
            size='small'
          >
            <Text tid='yes' />
          </Button>
          <Button
            variant='outlined'
            className={classes.alertButton2}
            onClick={props.handleModalNoClicked}
            size='small'
          >
            <Text tid='no' />
          </Button>
        </div>
      </div>
    </Modal>
  );
};
