import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import {
  Container,
  createStyles,
  makeStyles,
  withStyles,
  Theme,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  TableSortLabel,
  TablePagination,
  IconButton,
  useTheme,
} from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';
import { getDateTime } from '../../../utils/data';
import { Http } from '../../../utils';
import { IRootState } from '../../../reducers';
import {
  IBuildsListDataItem,
  STATUS_FAILED,
  //  STATUS_OTHER,
  STATUS_SUCCESS,
  STATUS_INPROGRESS,
} from '../../../model/metrics/buildsData';
import Loader from '../../loader';
import { ALL } from '../../../pages/metrics/metric-select';
import { Text } from '../../../common/Language';
import '../../../css/metrics/style.css';

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (
    a: { [key in Key]: number | string },
    b: { [key in Key]: number | string }
  ) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array: any[], comparator: (a: any, b: any) => number) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof IBuildsListDataItem;
  label: string;
  numeric: boolean;
}

const headCells: HeadCell[] = [
  { id: 'buildNum', numeric: false, disablePadding: true, label: 'buildId' },
  { id: 'teamId', numeric: true, disablePadding: false, label: 'team' },
  { id: 'service', numeric: false, disablePadding: false, label: 'service' },
  { id: 'projectName', numeric: true, disablePadding: false, label: 'project' },
  { id: 'status', numeric: true, disablePadding: false, label: 'status' },
  { id: 'startTimestamp', numeric: true, disablePadding: false, label: 'Start Date' },
  { id: 'endTimestamp', numeric: true, disablePadding: false, label: 'End Date' },
  { id: 'duration', numeric: true, disablePadding: false, label: 'duration' },
];

interface EnhancedTableProps {
  classes: ReturnType<typeof useStyles>;
  numSelected: number;
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof IBuildsListDataItem
  ) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { classes, order, orderBy, onRequestSort } = props;
  const createSortHandler =
    (property: keyof IBuildsListDataItem) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align='center'
            sortDirection={orderBy === headCell.id ? order : false}
            className='tableHeadMetrics'
          >
            <TableSortLabel
              hideSortIcon={true}
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              <label className='tableHeadMetrics'>
                <Text tid={headCell.label} />
              </label>
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    paper: {
      width: '100%',
      marginBottom: theme.spacing(2),
      boxShadow: '0px 0px 1px #888888',
    },
    table: {
      minWidth: 350,
    },

    container: {
      maxHeight: 200,
    },
  })
);

const useStyles1 = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexShrink: 0,
      marginLeft: theme.spacing(2.5),
    },
  })
);

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onChangePage: (
    event: React.MouseEvent<HTMLButtonElement>,
    newPage: number
  ) => void;
}

function TablePaginationActions(props: TablePaginationActionsProps) {
  const classes = useStyles1();
  const theme = useTheme();
  const { count, page, rowsPerPage, onChangePage } = props;

  const handleFirstPageButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    onChangePage(event, 0);
  };

  const handleBackButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    onChangePage(event, page - 1);
  };

  const handleNextButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    onChangePage(event, page + 1);
  };

  const handleLastPageButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    onChangePage(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <div className={classes.root}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label='first page'
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label='previous page'
      >
        {theme.direction === 'rtl' ? (
          <KeyboardArrowRight />
        ) : (
          <KeyboardArrowLeft />
        )}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label='next page'
      >
        {theme.direction === 'rtl' ? (
          <KeyboardArrowLeft />
        ) : (
          <KeyboardArrowRight />
        )}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label='last page'
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </div>
  );
}

const BuildTable = (props: any) => {
  const classes = useStyles();
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof IBuildsListDataItem>('buildNum');
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [passedBuild, setPassedBuild] = useState(true);
  const [failedBuild, setFailedBuild] = useState(true);
  const [rollbackBuild, setRollbackBuild] = useState(true);
  const [otherBuild, setOtherBuild] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [buildsData, setBuildsData] = useState<IBuildsListDataItem[]>([]);
  const [displayData, setDisplayData] = useState<IBuildsListDataItem[]>([]);
  const stateVariable = useSelector((state: IRootState) => {
    return state;
  });
  const [failureMsg, setFailureMsg] = useState(false);
  const [loader, setLoader] = useState(true);
  const [loadingTimeline, setLoadingTimeline] = useState(true);
  const history = useHistory();

  useEffect(() => {
    setLoadingTimeline(true);
    setDisplayData([]);
    fetchData();
  }, [props.focusTeam, props.focusService, props.focusSubService, props.focusServiceType, props.selectedDateRange]);

  useEffect(() => {
    let { buildStatus } = props;
    if ((buildStatus.status & 1) === 1) {
      setPassedBuild(!passedBuild);
    }
    if ((buildStatus.status & 2) === 2) {
      setFailedBuild(!failedBuild);
    }
    if ((buildStatus.status & 4) === 4) {
      setRollbackBuild(!rollbackBuild);
    }
    //    if ((props.buildStatus.status & 8) === 8) {
    //      setOtherBuild(!otherBuild);
    //    }
  }, [props.buildStatus]);

  useEffect(() => {
    let temp: IBuildsListDataItem[] = [];
    buildsData.map((data: IBuildsListDataItem) => {
      if ((passedBuild && data.status === STATUS_SUCCESS)
        || (failedBuild && data.status === STATUS_FAILED)
        || (rollbackBuild && data.status === STATUS_INPROGRESS)
        //        || (otherBuild && data.status === STATUS_OTHER)
      ) {
        temp.push(data);
      }
    });
    setDisplayData(temp);
  }, [passedBuild, failedBuild, rollbackBuild, otherBuild]);

  const fetchData = () => {
    let { timeline, focusTeam, focusService, focusSubService, focusServiceType, joinServiceAndSubService, selectedDateRange } = props;
    let url: string = '/api/metrics/builds/list';
    let joiner = '?';
    if (focusTeam[0] !== ALL) {
      url = `${url}${joiner}teamId=${focusTeam.toString()}`;
      joiner = '&';
    }
    if (focusService[0] !== ALL && focusSubService[0] !== ALL) {
      url = `${url}${joiner}service=${joinServiceAndSubService()}`;
      joiner = '&';
    } else if (focusService[0] !== ALL) {
      url = `${url}${joiner}service=${focusService.join()}`;
      joiner = '&';
    } else if (focusSubService[0] !== ALL) {
      url = `${url}${joiner}service=${focusSubService.join()}`;
      joiner = '&';
    }
    if (timeline !== 'one_day') {
      url = `${url}${joiner}fromDate=${selectedDateRange.fromDate}&toDate=${selectedDateRange.toDate}`;
      joiner = '&';
    }

    Http.get({
      url,
      state: stateVariable,
    })
      .then((response: any) => {
        if (response) {
          setBuildsData(response);
          setLoader(false);
          setLoadingTimeline(false);
          setPassedBuild(true);
          setFailedBuild(true);
          setOtherBuild(true);
          setDisplayData(response);
        } else {
          setLoader(false);
          setLoadingTimeline(false);
          setFailureMsg(true);
        }
      })
      .catch((error) => {
        setLoader(false);
        setLoadingTimeline(false);
        setFailureMsg(true);
        const perror = JSON.stringify(error);
        const object = JSON.parse(perror);
        if (object.code === 401) {
          history.push('/relogin')
        } else {
          history.push('/error')
        }
      });
  };

  const StyledTableRow = withStyles((theme: Theme) =>
    createStyles({
      root: {
        '&:nth-of-type(odd)': {
          backgroundColor: '#f1f1f1',
        },
      },
    })
  )(TableRow);

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof IBuildsListDataItem
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = displayData.map((n: any) => n.buildNum);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const convertMinsToHrsMins = (mins: number) => {
    let hours: any = Math.floor(mins / 60);
    let minutes: any = mins % 60;
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutes}`;
  };

  const emptyRows =
    rowsPerPage -
    Math.min(rowsPerPage, displayData.length - page * rowsPerPage);

  const renderTable = () => {
    return (
      <Paper className={classes.paper}>
        <TableContainer className={classes.container}>
          <Table
            stickyHeader
            aria-label='sticky table'
            className={classes.table}
            aria-labelledby='tableTitle'
            size='small'
          >
            <EnhancedTableHead
              classes={classes}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={Number(buildsData)}
            />
            <TableBody style={{ overflow: 'auto' }}>
              {displayData.length ? (
                stableSort(displayData, getComparator(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row: IBuildsListDataItem, index: number) => {
                    return (
                      <StyledTableRow key={index}>
                        <TableCell align='center'>
                          <a
                            href={row.url}
                            target='_blank'
                            rel='noopener noreferrer'
                            style={{ textDecoration: 'underline' }}
                          >
                            {row.buildNum}
                          </a>
                        </TableCell>
                        <TableCell align='center'>{row.teamId}</TableCell>
                        <TableCell align='center'>{row.service}</TableCell>
                        <TableCell align='center'>{row.projectName}</TableCell>
                        <TableCell align='center'>{row.status}</TableCell>
                        <TableCell align='center'>
                          {row.startTimestamp ? getDateTime(row.startTimestamp) : '-'}
                        </TableCell>
                        <TableCell align='center'>
                          {row.endTimestamp ? getDateTime(row.endTimestamp) : '-'}
                        </TableCell>
                        <TableCell align='center'>
                          {convertMinsToHrsMins(row.duration)}
                        </TableCell>
                      </StyledTableRow>
                    );
                  })
              ) : (
                <TableRow style={{ height: 33 * emptyRows }}>
                  <TableCell colSpan={6} align='center'>
                    {loadingTimeline ? 'Loading...' : 'No Records Found'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          labelRowsPerPage='Records per page'
          rowsPerPageOptions={[5, 10, 20, 50]}
          component='div'
          count={displayData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          labelDisplayedRows={({ to, count }) => `${to} of ${count}`}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
          ActionsComponent={TablePaginationActions}
        />
      </Paper>
    );
  };

  return (
    <div className={classes.root}>
      <Typography variant='subtitle2'>
        <Box
          fontWeight={700}
          className='subTitleMetricStyle'
          mb={props.loader || props.failureMsg ? 2 : 1.5}
        >
          <Text tid='buildsDetails' />
        </Box>
      </Typography>
      {loader ? (
        <Container className='loaderStyle'>
          <Loader />
        </Container>
      ) : failureMsg ? (
        <Alert severity='error'>
          <AlertTitle>
            <Text tid='error' />
          </AlertTitle>
          <Text tid='somethingWentWrong' />
        </Alert>
      ) : (
        renderTable()
      )}
    </div>
  );
};

export default withRouter(BuildTable);
