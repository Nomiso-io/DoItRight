// const env = process.env.REACT_APP_STAGE;
import { createMuiTheme } from '@material-ui/core';

export const buttonStyle = {
  color: '#042E5B',
  borderRadius: '2px',
  boxShadow: '0px 0px',
  borderWidth: '1px',
  borderColor: '#042E5B',
  '&:hover, &:focus, &:active': {
    color: '#FFFFFF',
    backgroundColor: '#042E5B',
    borderRadius: '2px',
    boxShadow: '0px 0px',
    borderWidth: '1px',
  },
};

export const timelineList = [
  { id: 'one_day', name: '1D' },
  { id: 'one_week', name: '1W' },
  { id: 'one_month', name: '1M' },
  { id: 'six_months', name: '6M' },
  { id: 'one_year', name: '1Y' },
  { id: 'ytd', name: 'YTD' },
  { id: 'all', name: 'ALL' },
];

export const tooltipTheme = createMuiTheme({
  overrides: {
    MuiTooltip: {
      tooltip: {
        color: '#ffffff',
        backgroundColor: '#000000',
        width: '15vw',
      },
    },
  },
});
