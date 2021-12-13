import React, { useEffect, useState, Fragment, version } from 'react';
import {
  Card,
  Container,
  Grid,
  Paper,
  makeStyles,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from '@material-ui/core';
import AnnouncementIcon from '@material-ui/icons/Announcement';
import AssessmentWiseChart from './assessment-wise';
import TeamWiseChart from './team-wise';
import Title from './common/title';
import { fetchTeamAssessments, useActions } from '../../actions';
import { useSelector } from 'react-redux';
import { IRootState } from '../../reducers';
import { Http } from '../../utils';
import { withRouter } from 'react-router-dom';
import Loader from '../../components/loader';
import { ITeamAssessment, ITeamInfo } from '../../model';
import { Text } from '../../common/Language';
import '../../css/assessments/style.css';

const useStyles = makeStyles((theme) => ({
  cardRoot: {
    width: '60%',
    padding: '15px',
    textAlign: 'center',
    margin: '5% 20%',
  },
  container: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(1),
    position: 'relative',
    top: '100px',
  },
  paper: {
    padding: theme.spacing(2),
    minHeight: '400px',
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  assessmentSelect: {
    minWidth: '30%',
  },
  teamSelect: {
    minWidth: '40%',
  },
}));

const Trends = (props: any) => {
  const classes = useStyles();
  const requestTeamAssessments = useActions(fetchTeamAssessments);
  const teamAssessments = useSelector(
    (state: IRootState) => state.assessment.teamAssessments
  );
  const [allTeamAssessments, setAllTeamAssessments] = useState<
    ITeamAssessment[]
  >([]);
  const [assessmentTypeAndVersion, setAssessmentTypeAndVersion] = useState('');
  const [assessmentType, setAssessmentType] = useState('');
  const [assessmentVersion, setAssessmentVersion] = useState('');
  const [selectedAssessment, setSelectedAssessment] = useState('');
  const [questionnaires, setQuestionnaires] = useState<any>(null);
  const [questionnairesFetch, setQuestionnairesFetch] = useState(false);
  const [focusTeam, setFocusTeam] = useState('');
  const [teamAssessmentState, setTeamAssessmentState] = useState(false);
  const [teamList, setTeamList] = useState<ITeamInfo[]>([]);
  const [assessmentList, setAssessmentList] = useState([{ id: '', name: '' }]);
  const [userLevels, setUserLevels] = useState<Object[]>([]);
  const [assessmentTeamsName, setAssessmentTeamsName] = useState<string[]>([]);
  const [assessmentTeamsScore, setAssessmentTeamsScore] = useState<number[]>(
    []
  );
  const [assessmentVersions, setAssessmentVersions] = useState<number[]>([]);
  const [assessmentVersionScore, setAssessmentVersionScore] = useState<
    number[]
  >([]);
  const [levelColor, setLevelColor] = useState<string[]>([]);
  const stateVariable = useSelector((state: IRootState) => {
    return state;
  });

  useEffect(() => {
    getQuestionnaires();
    getTeams();
    requestTeamAssessments();
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (teamAssessments.status === 'success' && teamAssessments.data !== null) {
      setAllTeamAssessments(teamAssessments.data.teams.sort(compareAssessment));
      setUserLevels(teamAssessments.data.userLevels);
    }
  }, [teamAssessments]);

  useEffect(() => {
    let teams: string[] = [];
    let teamsScores: number[] = [];
    let selectedAssessmentData: any[] = [];
    let allVersions: number[] = [];
    let colors: string[] = [];
    let teamQuestonnaires: any[] = [];
    let teamsCount: number = 0;
    let versionsCount: number = 0;
    const map = new Map();

    if (questionnaires) {
      allTeamAssessments.sort((a: any, b: any) => {
        return a.averageScore - b.averageScore;
      });
      allTeamAssessments.map((assessment: any) => {
        if (
          assessmentTypeAndVersion !== ''
            ? assessmentType === assessment.type &&
            assessmentVersion === assessment.questionnaireVersion
            : questionnaires[0].questionnaireId === assessment.type &&
            questionnaires[0].version === assessment.questionnaireVersion
        ) {
          userLevels.forEach((level: any) => {
            if (
              assessment.averageScore >= level.lowerLimit &&
              assessment.averageScore <= level.upperLimit
            ) {
              colors.push(level.color);
            }
          });
          teamsCount += 1;
          teams.push(assessment.teamName);
          teamsScores.push(assessment.averageScore);
          if (teams && teamsScores) {
            setAssessmentTeamsName(teams);
            setAssessmentTeamsScore(teamsScores);
            setLevelColor(colors);
          }
        }
      });
      if (!teamsCount) {
        setAssessmentTeamsName([]);
        setAssessmentTeamsScore([]);
      }
    }

    if (teamList.length && questionnaires) {
      for (const item of questionnaires) {
        if (!map.has(item.displayName)) {
          map.set(item.displayName, true); // set any value to Map
          teamQuestonnaires.push({
            id: item.questionnaireId,
            name: item.displayName,
          });
        }
      }
      allTeamAssessments.sort((a: any, b: any) => {
        return a.averageScore - b.averageScore;
      });
      allTeamAssessments.map((assessment: any) => {
        allVersions.push(assessment.questionnaireVersion);
        if (
          selectedAssessment !== ''
            ? selectedAssessment === assessment.type &&
              (focusTeam ? focusTeam : teamList[0].teamId) ===
                assessment.teamId
            : teamQuestonnaires[0].id === assessment.type &&
              (focusTeam ? focusTeam : teamList[0].teamId) ===
                assessment.teamId
        ) {
          userLevels.forEach((level: any) => {
            if (
              assessment.averageScore >= level.lowerLimit &&
              assessment.averageScore <= level.upperLimit
            ) {
              colors.push(level.color);
            }
          });
          versionsCount += 1;
          selectedAssessmentData.push(assessment);
          setTeamAssessmentState(true);
        }
      });
      setAssessmentList(teamQuestonnaires);

      if (versionsCount) {
        let totalAssessmentVersions = Array.from(new Set(allVersions));
        let allVersionsScores = Array(totalAssessmentVersions.length);
        setAllZero(allVersionsScores, 0);

        selectedAssessmentData.map((assessment) => {
          allVersionsScores[assessment.questionnaireVersion - 1] =
            assessment.averageScore;
        });
        setAssessmentVersions(totalAssessmentVersions);
        setAssessmentVersionScore(allVersionsScores);
      }
      if (!versionsCount) {
        setAssessmentVersions([]);
        setAssessmentVersionScore([]);
      }
    }
  }, [
    questionnaires,
    allTeamAssessments,
    assessmentTypeAndVersion,
    focusTeam,
    selectedAssessment,
  ]);

  function setAllZero(a: any, v: any) {
    var i,
      n = a.length;
    for (i = 0; i < n; ++i) {
      a[i] = v;
    }
  }

  function compareAssessment(a: ITeamAssessment, b: ITeamAssessment) {
    if (!a.assessmentName) {
      return -1;
    }
    if (!b.assessmentName) {
      return 1;
    }
    if (a.assessmentName < b.assessmentName) {
      return -1;
    }
    if (a.assessmentName > b.assessmentName) {
      return 1;
    }
    if (a.questionnaireVersion < b.questionnaireVersion) {
      return -1;
    }
    if (a.questionnaireVersion > b.questionnaireVersion) {
      return 1;
    }
    return 0;
  }

  const getTeams = () => {
    Http.get({
      url: `/api/v2/teamlist`,
      state: stateVariable,
    })
      .then((response: any) => {
        const teamListCopy = [...response].filter((a: any) => a.active === 'true');
        setTeamList(
          teamListCopy.sort((a: any, b: any) => {
            return a.teamName.localeCompare(b.teamName);
          })
        );
      })
      .catch((error: any) => {
        const perror = JSON.stringify(error);
        const object = JSON.parse(perror);
        if (object.code === 401) {
          props.history.push('/relogin');
        }
      });
  };

  const handleChangeQuestonnaireValue = (event: any) => {
    let assessmentTypeAndVersion = event.target.value;
    let id = '';
    let version = '';
    id = assessmentTypeAndVersion.substring(
      0,
      assessmentTypeAndVersion.indexOf('+')
    );
    version = assessmentTypeAndVersion.substring(
      assessmentTypeAndVersion.indexOf('+') + 1
    );

    setFocusTeam('');
    setAssessmentType(id);
    setAssessmentVersion(version);
    setAssessmentTypeAndVersion(assessmentTypeAndVersion);
  };

  const getQuestionnaires = () => {
    Http.get({
      url: `/api/v2/assignment?dashboard=true`,
      state: stateVariable,
    })
      .then((response: any) => {
        const filteredQuestionnaires: any = [];
        response.questionnaires.forEach((el: any) => {
          if (response.questionnaireSelected.includes(el.questionnaireId)) {
            filteredQuestionnaires.push(el);
          }
        });
        setQuestionnairesFetch(true);
        setQuestionnaires(
          filteredQuestionnaires.sort((a: any, b: any) => {
            return a.displayName.localeCompare(b.displayName);
          })
        );
      })
      .catch((error) => {
        const perror = JSON.stringify(error);
        const object = JSON.parse(perror);
        if (object.code === 401) {
          props.history.push('/relogin');
        } else {
          props.history.push('/error');
        }
      });
  };

  const handleChangeFocusTeamValue = (event: any) => {
    let team = event.target.value;
    setFocusTeam(team);
    setTeamAssessmentState(false);
  };

  const handleChangeTeamQuestonnaire = (event: any) => {
    let assessment = event.target.value;
    setSelectedAssessment(assessment);
    setTeamAssessmentState(false);
  };

  const renderAssessmentWiseTrends = () => {
    return (
      <Fragment>
        <Grid
          container
          spacing={3}
          className='topScrollContainerAsssessment'
          id='assessmentWise'
        >
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid item xs={12} sm={12} md={12} lg={12}>
                <Title>
                  <Text tid='assessmentWiseReport' />
                </Title>
              </Grid>
              <Grid item xs={12} sm={12} md={12} lg={12}>
                <FormControl
                  className={classes.assessmentSelect}
                  style={{ marginRight: '20%' }}
                >
                  <InputLabel id='demo-simple-select-label'>
                    <Text tid='chooseAssessment' />
                  </InputLabel>
                  <Select
                    value={
                      assessmentTypeAndVersion !== ''
                        ? assessmentTypeAndVersion
                        : questionnaires
                          ? questionnaires.length > 0
                            ? `${questionnaires[0].questionnaireId}+${questionnaires[0].version}`
                            : ''
                          : ''
                    }
                    onChange={handleChangeQuestonnaireValue}
                  >
                    {questionnaires &&
                      questionnaires.map((opt: any) => {
                        return (
                          <MenuItem
                            key={`${opt.questionnaireId}+${opt.version}`}
                            value={`${opt.questionnaireId}+${opt.version}`}
                          >
                            {`${opt.displayName} - v${opt.version}`}
                          </MenuItem>
                        );
                      })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                {allTeamAssessments.length && questionnairesFetch ? (
                  !assessmentTeamsName.length ? (
                    <Card className={classes.cardRoot}>
                      <Typography gutterBottom variant='h6' component='h2'>
                        <Text tid='noOneInTheTeamHasTakenTheAssessment' />
                        <AnnouncementIcon />
                      </Typography>
                    </Card>
                  ) : (
                    <AssessmentWiseChart
                      assessmentTeamsName={assessmentTeamsName}
                      assessmentTeamsScore={assessmentTeamsScore}
                      levelColor={levelColor}
                    />
                  )
                ) : (
                  <div style={{ marginBottom: '10%' }}>{renderLoader()}</div>
                )}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Fragment>
    );
  };

  const renderTeamWiseTrends = () => {
    return (
      <Fragment>
        <Grid
          container
          spacing={3}
          className='topScrollContainerAsssessment'
          id='teamWise'
        >
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid item xs={12} sm={12} md={12} lg={12}>
                <Title>
                  <Text tid='teamWiseReport' />
                </Title>
              </Grid>
              <Grid item xs={12} sm={12} md={12} lg={12}>
                <FormControl className={classes.assessmentSelect}>
                  <InputLabel id='demo-simple-select-label'>
                    <Text tid='chooseAssessment' />
                  </InputLabel>
                  <Select
                    value={
                      selectedAssessment !== ''
                        ? selectedAssessment
                        : assessmentList[0].id
                    }
                    onChange={handleChangeTeamQuestonnaire}
                  >
                    {assessmentList &&
                      assessmentList.map((opt: any) => {
                        return (
                          <MenuItem key={opt.id} value={opt.id}>
                            {opt.name}
                          </MenuItem>
                        );
                      })}
                  </Select>
                </FormControl>
                <FormControl className={classes.teamSelect}>
                  <InputLabel
                    id='demo-simple-select-label'
                    style={{ marginLeft: '25%' }}
                  >
                    <Text tid='chooseTeam' />
                  </InputLabel>
                  <Select
                    value={
                      focusTeam !== ''
                        ? focusTeam
                        : teamList
                          ? teamList.length > 0
                            ? teamList[0].teamId
                            : ''
                          : ''
                    }
                    style={{ marginLeft: '25%' }}
                    onChange={handleChangeFocusTeamValue}
                  >
                    {teamList.length > 0 &&
                      // mappedTeams.length > 0 &&
                      teamList.map((opt: any, i: number) => {
                        // if (!mappedTeams.includes(opt.teamId)) {
                        //   return;
                        // }
                        return (
                          <MenuItem key={i} value={opt.teamId}>
                            {opt.teamName}
                          </MenuItem>
                        );
                      })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                {allTeamAssessments.length && questionnairesFetch ? (
                  !teamAssessmentState ? (
                    <Card className={classes.cardRoot}>
                      <Typography gutterBottom variant='h6' component='h2'>
                        <Text tid='noOneInTheTeamHasTakenTheAssessment' />
                        <AnnouncementIcon />
                      </Typography>
                    </Card>
                  ) : (
                    <TeamWiseChart
                      assessmentVersions={assessmentVersions}
                      assessmentVersionScore={assessmentVersionScore}
                      levelColor={levelColor}
                    />
                  )
                ) : (
                  <div style={{ marginBottom: '10%' }}>{renderLoader()}</div>
                )}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Fragment>
    );
  };

  const renderLoader = () => {
    return (
      <Container maxWidth='md' component='div' className='loaderStyle'>
        <Loader />
      </Container>
    );
  };

  return (
    <Fragment>
      <Container maxWidth='md' className={classes.container}>
        {renderAssessmentWiseTrends()}
        {renderTeamWiseTrends()}
      </Container>
    </Fragment>
  );
};

export default withRouter(Trends);
