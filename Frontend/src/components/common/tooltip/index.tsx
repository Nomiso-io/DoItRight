import { Tooltip } from '@material-ui/core';
import { withStyles, Theme } from '@material-ui/core/styles';

export const LightTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    position: 'absolute',
    backgroundColor: theme.palette.common.white,
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
}))(Tooltip);
