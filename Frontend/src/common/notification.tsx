import React from 'react'
import { Snackbar, makeStyles } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
import { Text } from '../common/Language';

function Alert(props: any) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles(theme => ({
    root: {
        top: theme.spacing(9)
    }
}))

export default function Notification(props: any) {

    const { notify, setNotify } = props;
    const classes = useStyles()

    const handleClose = (event: any, reason: any) => {
        if (reason === 'clickaway') {
            return;
        }
        setNotify({
            ...notify,
            isOpen: false
        })
    }

    return (
        <Snackbar
            className={classes.root}
            open={notify.isOpen}
            autoHideDuration={3000}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            onClose={handleClose}>
            <Alert
                severity={notify.type}
            >
                {
                 <Text tid={notify.message} />
                }
            </Alert>
        </Snackbar>
    )
}
