import React, { useEffect } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Rating from '@material-ui/lab/Rating';
import StarIcon from '@material-ui/icons/Star';
import { useActions } from '../../actions';
import { useSelector } from 'react-redux';
import { IRootState } from '../../reducers';
import { postFeedback } from '../../actions/feedback';
import { Text } from '../../common/Language';
import './style.css';
import { withStyles } from '@material-ui/styles';

const StyledRating = withStyles({
  iconFilled: {
    color: '#FFB539',
  },
  iconHover: {
    color: '#FFB539',
  },
})(Rating);

const Feedback = () => {
  const [open, setOpen] = React.useState(false);
  const [rating, setRating] = React.useState<number | null>(0);
  const [comment, setComment] = React.useState('');
  const postAssessmentFeedback = useActions(postFeedback);
  const feedback = useSelector((state: IRootState) => state.assessment.feedback);
  const assessmentData = useSelector(
    (state: IRootState) => state.assessment.assessmentSummary
  );
  function handleClose() {
    setOpen(false);
  }
  function handleSubmit() {
    setOpen(false);
    if (feedback.status !== 'success') {
      postAssessmentFeedback(
        {
          rating,
          comment,
        },
        assessmentData.data!.assessmentId
      );
    }
  }

  useEffect(() => {
    const timerRef = setTimeout(() => {
      setOpen(true);
    }, 3000);

    return () => clearTimeout(timerRef);
  }, []);

  function handleRatingClick(event: object, value: number | null) {
    // console.log('Rating value --', value);
    setRating(value);
  }

  /* function handleRatingClick(value: number) {
         console.log('Rating value --', value);
         setRating(value);
     }*/

  function handleCommentChange(event: any) {
    // console.log('comment click--', event.target.value);
    setComment(event.target.value);
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby='form-dialog-title'
    >
      <DialogTitle id='form-dialog-title'>
        <Text tid='rateYourExperienceWithYourAssessment' />
      </DialogTitle>
      <DialogContent>
        <StyledRating
          name='size-large'
          size='large'
          value={rating}
          precision={1}
          onChange={handleRatingClick}
          icon={<StarIcon fontSize='large' />}
        />
        <TextField
          id='standard-textarea'
          label='Please provide your comments here'
          multiline
          fullWidth
          margin='normal'
          onChange={handleCommentChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color='primary'>
          <Text tid='cancel' />
        </Button>
        <Button onClick={handleSubmit} color='primary'>
          <Text tid='submit' />
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default Feedback;
