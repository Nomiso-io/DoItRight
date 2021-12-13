import React, { useState, useEffect, Fragment } from 'react';
import { makeStyles, withStyles, Theme } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
// import Title from '../common/title';
import {
  Container,
  ExpansionPanel,
  ExpansionPanelSummary,
  Typography,
  ExpansionPanelDetails,
  Tooltip,
} from '@material-ui/core';
import { withRouter } from 'react-router-dom';
import { Loader } from '../../..';
import { sortTable } from './tableSort';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import InfoIcon from '@material-ui/icons/Info';
import '../../../../css/assessments/style.css';

export interface IResultsTable {
  [questionId: string]: ResultsTableItem;
}

// const bestPerformingTooltipText = 'These are the questions where the teams have performed well. The goal should be to continue to excel in these areas.';
// const areasNeedingFocusTooltipText = 'These are the questions where teams have scored low scores. These areas need focused attention to increase maturity.';

export interface ResultsTableItem {
  question: string;
  category: string;
  weightage: {
    [weightage: string]: number;
  };
  sortFactor: number;
  //  totalFactor?: number;
  constant?: number;
}

const useStyles = makeStyles((theme) => ({
  categoryPanel: {
    marginBottom: '5px',
    height: '30%',
  },
  headingp: {
    fontSize: theme.typography.pxToRem(20),
    fontWeight: theme.typography.fontWeightRegular,
    color: 'white',
  },
  infoIcon: {
    color: 'white',
    float: 'right',
    cursor: 'pointer',
    marginLeft: '5px',
  },
  // questionCell: {
  //   minWidth: '300px',
  //   maxWidth: '500px',
  // },
  // limitTableCells: {
  //   maxWidth: '80px',
  //   padding: '6px 9px',
  // },
}));

const HtmlTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
  },
}))(Tooltip);

const ResultsTable = (props: any) => {
  const classes = useStyles();
  const [bottomAssessments, setBottomAssessments] = useState<
    ResultsTableItem[]
  >([]);
  const [topAssessments, setTopAssessments] = useState<ResultsTableItem[]>([]);
  const [neutralAssessments, setNeutralAssessments] = useState<
    ResultsTableItem[]
  >([]);

  useEffect(() => {
    const numberOfQuestions = props.data ? Object.keys(props.data).length : 0;
    let constant = 0;
    if (!props.constant) {
      if (numberOfQuestions >= 6) {
        constant = 3;
      } else if (numberOfQuestions < 6 && numberOfQuestions >= 4) {
        constant = 2;
      }
    } else {
      constant = props.constant;
    }
    if (props.data) {
      // Sorted in an increasing order of performance.
      sortTable(props.data)
        .then((data) => {
          setBottomAssessments(data.splice(0, constant));
          setNeutralAssessments(data.splice(0, data.length - constant));
          setTopAssessments(data);
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }, [props.data, props.constant]);

  if (!props.data) {
    return (
      <Container maxWidth='md' component='div' className='loaderStyle'>
        <Loader />
      </Container>
    );
  }
  let tableHeadData = ['Category', 'Questions', 'Score (%)'];
  let largestWeightageObject = props.data[Object.keys(props.data)[0]].weightage;
  Object.keys(props.data).forEach((el: string) => {
    if (
      Object.keys(props.data[el].weightage).length >
      Object.keys(largestWeightageObject).length
    ) {
      largestWeightageObject = props.data[el].weightage;
    }
  });

  tableHeadData = tableHeadData.concat(Object.keys(largestWeightageObject));

  const renderExpansionPanel = (
    heading: string,
    questions: ResultsTableItem[],
    backgroundColor: string,
    tooltipText?: string
  ) => {
    return (
      <Fragment>
        <ExpansionPanel style={{ maxWidth: '100%' }}>
          <ExpansionPanelSummary
            className={classes.categoryPanel}
            style={{ backgroundColor }}
            expandIcon={<ExpandMoreIcon style={{ fill: 'white' }} />}
            aria-controls='panel1a-content'
            id='panel1a-header'
          >
            <Typography variant='h4' className={classes.headingp}>
              {heading}
            </Typography>
            {tooltipText && (
              <HtmlTooltip title={<Typography>{tooltipText}</Typography>}>
                <div className={classes.infoIcon}>
                  <InfoIcon style={{ fontSize: 23 }} />
                </div>
              </HtmlTooltip>
            )}
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <div>{renderTable(questions)}</div>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </Fragment>
    );
  };

  const renderTable = (data: ResultsTableItem[]) => {
    return (
      <Table size='small'>
        <TableHead>
          <TableRow>
            {tableHeadData.map((el: string, i: number) => {
              if (i === 0) {
                return <TableCell key={el}>{el}</TableCell>;
              }
              if (i === 1) {
                return (
                  <TableCell align='center' key={el}>
                    {el}
                  </TableCell>
                );
              }
              if (el.startsWith('Score')) {
                return (
                  <TableCell
                    align='center'
                    key={el}
                  // className={classes.limitTableCells}
                  >
                    {el}
                  </TableCell>
                );
              }
              return (
                <TableCell
                  align='center'
                  key={el}
                // className={classes.limitTableCells}
                >{`Weightage ${el}`}</TableCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row: ResultsTableItem, i: number) => (
            <TableRow key={i}>
              <TableCell style={{ color: 'inherit' }}>{row.category}</TableCell>
              <TableCell
                align='left'
                style={{ color: 'inherit' }}
              // className={classes.questionCell}
              >
                {row.question}
              </TableCell>
              <TableCell
                align='center'
                style={{ color: 'inherit' }}
              // className={classes.limitTableCells}
              >
                {/*row.totalFactor ? Math.trunc(row.totalFactor) : 0*/}
                {row.sortFactor}
              </TableCell>
              {Object.keys(largestWeightageObject).map((el) => (
                <TableCell
                  align='center'
                  key={el}
                  style={{ color: 'inherit' }}
                // className={classes.limitTableCells}
                >
                  {row.weightage[el]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <Fragment>
      {renderExpansionPanel(
        'Best performing areas ',
        topAssessments,
        '#1D6906'
      )}
      {renderExpansionPanel(
        'Areas for improvement',
        bottomAssessments,
        '#C02217'
      )}
      {renderExpansionPanel('Others', neutralAssessments, '#0073A3')}
    </Fragment>
  );
};

export default withRouter(ResultsTable);
