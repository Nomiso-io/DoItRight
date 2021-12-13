import React, { useEffect, useState } from 'react';
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
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Loader from '../../loader';
import { Http } from '../../../utils';
import { IRootState } from '../../../reducers';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';
import { IRepoPullReqsDataItem } from '../../../model/metrics/repositoryData';
import { ALL } from '../../../pages/metrics/metric-select';
import { Text } from '../../../common/Language';
import '../../../css/metrics/style.css';

interface Data {
  projectName: string;
  teamId: string;
  committerName: string;
  commitsCreated: number;
  commitsAccepted: number;
  commitsRejected: number;
}

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
  id: keyof Data;
  label: string;
  numeric: boolean;
}

const headCells: HeadCell[] = [
  {
    id: 'projectName',
    numeric: false,
    disablePadding: true,
    label: 'project',
  },
  { id: 'teamId', numeric: false, disablePadding: true, label: 'team' },
  {
    id: 'committerName',
    numeric: false,
    disablePadding: true,
    label: 'committer',
  },
  {
    id: 'commitsCreated',
    numeric: true,
    disablePadding: false,
    label: 'raised',
  },
  {
    id: 'commitsAccepted',
    numeric: true,
    disablePadding: false,
    label: 'accepted',
  },
  {
    id: 'commitsRejected',
    numeric: true,
    disablePadding: false,
    label: 'rejected',
  },
];

interface EnhancedTableProps {
  classes: ReturnType<typeof useStyles>;
  numSelected: number;
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof Data
  ) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { classes, order, orderBy, onRequestSort } = props;
  const createSortHandler =
    (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
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
            rowSpan={1}
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
      marginBottom: theme.spacing(1),
      boxShadow: '0px 0px 1px #888888',
    },
    table: {
      minWidth: 300,
    },
    container: {
      maxHeight: 208,
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

export default function RepositoryTable(props: any) {
  const classes = useStyles();
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Data>('committerName');
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const stateVariable = useSelector((state: IRootState) => {
    return state;
  });
  const [repositoryData, setRepositoryData] = useState<IRepoPullReqsDataItem[]>(
    []
  );
  const [failureMsg, setFailureMsg] = useState(false);
  const [loader, setLoader] = useState(true);
  const [loadingTimeline, setLoadingTimeline] = useState(true);
  const history = useHistory();

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
    property: keyof Data
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  useEffect(() => {
    setLoadingTimeline(true);
    setRepositoryData([]);
    fetchData();
  }, [
    props.focusTeam,
    props.focusService,
    props.focusSubService,
    props.focusServiceType,
    props.selectedDateRange,
    props.committerName,
  ]);

  const fetchData = () => {
    let { focusTeam, focusService, focusSubService, focusServiceType, joinServiceAndSubService, committerName, timeline, selectedDateRange } = props;
    let url: string = '/api/metrics/repos/repositoryList';
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
    if (focusServiceType[0] !== ALL) {
      url = `${url}${joiner}serviceType=${focusServiceType.join()}`;
      joiner = '&';
    }
    if (committerName[0] !== ALL) {
      url = `${url}${joiner}committer=${committerName.toString()}`;
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
          setRepositoryData(response);
          setLoader(false);
          setLoadingTimeline(false);
        } else {
          setLoader(false);
          setLoadingTimeline(false);
          setFailureMsg(true);
        }
      })
      .catch((error: any) => {
        setLoader(false);
        setLoadingTimeline(false);
        setFailureMsg(true);
        const perror = JSON.stringify(error);
        const object = JSON.parse(perror);
        if (object.code === 401) {
          history.push('/relogin')
        }
      });
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = repositoryData.map((n: any) => n.buildNum);
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

  const emptyRows =
    rowsPerPage -
    Math.min(rowsPerPage, repositoryData.length - page * rowsPerPage);

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
              rowCount={Number(repositoryData)}
            />
            <TableBody style={{ overflow: 'auto' }}>
              {repositoryData.length ? (
                stableSort(repositoryData, getComparator(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => {
                    return (
                      <StyledTableRow key={index}>
                        <TableCell align='center'>
                          <a
                            href={row.url}
                            target='_blank'
                            rel='noopener noreferrer'
                            style={{ textDecoration: 'underline' }}
                          >
                            {row.projectName}
                          </a>
                        </TableCell>
                        <TableCell align='center' style={{ minWidth: '100px' }}>
                          {row.teamId}
                        </TableCell>
                        <TableCell align='center'>
                          {row.committerName}
                        </TableCell>
                        <TableCell align='center'>
                          {row.commitsCreated}
                        </TableCell>
                        <TableCell align='center'>
                          {row.commitsAccepted}
                        </TableCell>
                        <TableCell align='center'>
                          {row.commitsRejected}
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
          count={repositoryData.length}
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
      <Typography variant='subtitle2' className='subTitleMetricStyle'>
        <Box fontWeight={700} mb={loader || failureMsg ? 2 : 1.5}>
          <Text tid='pullRequestDetails' />
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
}
