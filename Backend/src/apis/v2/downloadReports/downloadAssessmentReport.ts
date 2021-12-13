import { Question } from '@models/index';
import { config } from '@root/config';
import {
  AssessmentDocument,
  getAssessmentHistory,
  getQuestionDetails,
  getQuestionDetailsBySplitingId,
  getTeamIds,
  getTeamIdsByQuestionnaire,
  getTeamMembers,
} from '@root/utils';

interface QuestionNAnswers {
  [questionId: string]: Question;
}

function memorySizeOf(object: any) {
  let bytes = 0;

  function sizeOf(obj: any) {
    if (obj !== null && obj !== undefined) {
      switch (typeof obj) {
        case 'number':
          bytes += 8;
          break;
        case 'string':
          bytes += obj.length * 2;
          break;
        case 'boolean':
          bytes += 4;
          break;
        case 'object':
          const objClass = Object.prototype.toString.call(obj).slice(8, -1);
          if (objClass === 'Object' || objClass === 'Array') {
            for (const key of obj) {
              if (!obj.hasOwnProperty(key)) {
                continue;
              }
              sizeOf(obj[key]);
            }
          } else {
            bytes += obj.toString().length * 2;
          }
          break;
        default:
          console.log(0);
      }
    }
    return bytes;
  }

  function formatByteSize(bytes2: any) {
    if (bytes2 < 1024) {
      return bytes2 + ' bytes';
    }
    if (bytes2 < 1048576) {
      return (bytes2 / 1024).toFixed(3) + ' KiB';
    }
    if (bytes2 < 1073741824) {
      return (bytes2 / 1048576).toFixed(3) + ' MiB';
    }
    return (bytes2 / 1073741824).toFixed(3) + ' GiB';
  }

  return formatByteSize(sizeOf(object));
}

function removeLinebreaks(str: string) {
  return str.toString().replace(/[\r\n"]+/gm, '');
}

//const prepareData = async (val: AssessmentDocument, questionNAnswers: QuestionNAnswers) => {
// tslint:disable-next-line: cyclomatic-complexity
const prepareData = async (val: AssessmentDocument) => {
  const questionNAnswers: QuestionNAnswers = {};
  const myResult: any = new Array();
  const list: any[] = Object.keys(
    val.assessmentDetails ? val.assessmentDetails : {}
  );
  const userList: any = {};
  const weightageCoefficient = config.defaults.scoreCoeff;
  let maxOptionsCount = 0;
  let maxAnswersCount = 0;
  for (const quesId of list) {
    const questionDetails = await getQuestionDetailsBySplitingId(quesId);
    questionNAnswers[quesId] = questionDetails;
    const numberOfOptions = Object.keys(questionDetails.answers).length;
    if (numberOfOptions > maxOptionsCount) {
      maxOptionsCount = numberOfOptions;
    }
  }

  for (const questionId of list) {
    const selections: string[] = val.assessmentDetails
      ? val.assessmentDetails[questionId].answers
      : [];
    if (selections.length > maxAnswersCount) {
      maxAnswersCount = selections.length;
    }
  }

  for (const questionId of list) {
    // const selection: string = val.assessmentDetails ? val.assessmentDetails[questionId].answers[0] : '@N/A';
    const selections: string[] = val.assessmentDetails
      ? val.assessmentDetails[questionId].answers
      : [];
    const data: any = {
      assessmentName: val.assessmentName,
      date: val.date,
      team: userList[val.userId],
      user: val.userId,
    };
    if (questionNAnswers[questionId]) {
      data.question = questionNAnswers[questionId].question;
      const answers: object[] = [];
      let answerCount = 0;
      for (const selection of selections) {
        const obj: any = {};
        obj[`answer-selected-${answerCount + 1}`] = questionNAnswers[questionId]
          .answers[selection]
          ? removeLinebreaks(
              questionNAnswers[questionId].answers[selection].answer
            )
          : '';
        obj[`answer-Weightage-${answerCount + 1}`] = questionNAnswers[
          questionId
        ].answers[selection]
          ? questionNAnswers[questionId].answers[selection].weightageFactor *
            weightageCoefficient
          : '';
        answers.push(obj);
        answerCount += 1;
      }
      Object.keys(questionNAnswers[questionId].answers).forEach(
        (aid: string, i: number) => {
          data[`Option${i}`] = questionNAnswers[questionId].answers[aid]
            ? removeLinebreaks(questionNAnswers[questionId].answers[aid].answer)
            : '';
          data[`Option${i}-Weightage`] = questionNAnswers[questionId].answers[
            aid
          ]
            ? questionNAnswers[questionId].answers[aid].weightageFactor *
              weightageCoefficient
            : '';
        }
      );
      const numberOfOptions = Object.keys(questionNAnswers[questionId].answers)
        .length;
      if (numberOfOptions < maxOptionsCount) {
        for (let i = numberOfOptions; i < maxOptionsCount; i += 1) {
          data[`Option${i}`] = '';
          data[`Option${i}-Weightage`] = '';
        }
      }
      data.answers = answers;
    } else {
      const quesDetails = await getQuestionDetails(questionId);
      data.question = quesDetails.question;
      const answers: object[] = [];
      let answerCount = 0;
      for (const selection of selections) {
        const obj: any = {};
        obj[`answer-selected-${answerCount + 1}`] = quesDetails.answers[
          selection
        ]
          ? removeLinebreaks(quesDetails.answers[selection].answer)
          : '';
        obj[`answer-Weightage-${answerCount + 1}`] = quesDetails.answers[
          selection
        ]
          ? quesDetails.answers[selection].weightageFactor *
            weightageCoefficient
          : '';
        answers.push(obj);
        answerCount += 1;
      }
      Object.keys(quesDetails.answers).forEach((aid: string, i: number) => {
        data[`Option${i}`] = quesDetails.answers[aid]
          ? removeLinebreaks(quesDetails.answers[aid].answer)
          : '';
        data[`Option${i}-Weightage`] = quesDetails.answers[aid]
          ? quesDetails.answers[aid].weightageFactor * weightageCoefficient
          : '';
      });
      const numberOfOptions = Object.keys(quesDetails.answers).length;
      if (numberOfOptions < maxOptionsCount) {
        for (let i = numberOfOptions; i < maxOptionsCount; i += 1) {
          data[`Option${i}`] = '';
          data[`Option${i}-Weightage`] = '';
        }
      }
      data.answers = answers;
    }
    myResult.push(data);
  }
  return myResult;
};

export const downloadAssessmentReports = async (
  userId: string,
  assessmentType: any,
  isAdmin: boolean,
  cognitoUserId: string,
  version?: string
): Promise<any> => {
  let myResult: any[] = new Array();
  const teamsManagedByUser: string[] = await getTeamIds(userId);
  if (teamsManagedByUser.length === 0 && !isAdmin) {
    return {};
  }
  const teamsAssignedWithTheQuestionnaire: string[] = await getTeamIdsByQuestionnaire(
    assessmentType
  );
  let teamMembers: string[] = [];
  for (const teamId of teamsManagedByUser) {
    if (teamsAssignedWithTheQuestionnaire.includes(teamId)) {
      const teamMembersForTeam: string[] = await getTeamMembers(teamId);
      teamMembers = teamMembers.concat(teamMembersForTeam);
    }
  }

  const assessmentHistory: AssessmentDocument[] = isAdmin
    ? await getAssessmentHistory({
        questionnaireId: assessmentType,
        questionnaireVersion: version,
        teamMembers: [],
        type: 'all_teams',
        userId,
      })
    : await getAssessmentHistory({
        questionnaireId: assessmentType,
        questionnaireVersion: version,
        teamMembers,
        type: 'qid',
        userId,
      });
  for (const val of assessmentHistory) {
    if (val.assessmentDetails) {
      const resultItem = await prepareData(val);
      myResult = myResult.concat(resultItem);
    }
  }
  let maxNumberOfAnswers = 0;
  for (const result of myResult) {
    if (Object.keys(result.answers).length > maxNumberOfAnswers) {
      maxNumberOfAnswers = Object.keys(result.answers).length;
    }
  }

  // The code snippet written below will add empty answer fields for the questions containing
  // lesser number of answers than the question with the maximum number of answers
  // This will result in the creation of a proper excel sheet in the frontend.
  const newResult: any = [];
  for (const result of myResult) {
    const resultCopy = { ...result };
    let numberOfAnswers = 0;
    for (const answer of result.answers) {
      for (const key of Object.keys(answer)) {
        resultCopy[key] = answer[key];
      }
      numberOfAnswers += 1;
    }
    if (numberOfAnswers < maxNumberOfAnswers) {
      for (let i = numberOfAnswers; i < maxNumberOfAnswers; i += 1) {
        resultCopy[`answer-selected-${i + 1}`] = '';
        resultCopy[`answer-Weightage-${i + 1}`] = '';
      }
    }
    delete resultCopy.answers;
    newResult.push(resultCopy);
  }
  console.log('Size of the response:', memorySizeOf(newResult));
  return newResult;
};
