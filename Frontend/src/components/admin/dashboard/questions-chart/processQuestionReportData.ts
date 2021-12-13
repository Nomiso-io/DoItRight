import { IResponseData, hexColors } from '../common/common';
import { IQuestionIdentifier } from '..';
import { IBarDisplayData } from '../category-bar-chart/bar';

export const processQuestionReportData =
  (responseData: IResponseData, teamId: string, question: IQuestionIdentifier, questionList: any) => {
    const numberOfAnswers = Object.keys(questionList[question.id].answers).length;
    const label: string[] = [];
    const graphData: IBarDisplayData = {
      labels: [],
      datasets: []
    };
    try {
      let answerArray = Object.keys(questionList[question.id].answers);
      if (questionList[question.id] && !questionList[question.id]!.randomize) {
        answerArray = answerArray.sort((a, b) => {
          return questionList[question.id].answers[a].weightageFactor >
            questionList[question.id].answers[b].weightageFactor ?
            1 : -1
        })
      }

      answerArray.forEach((el: string, i: number) => {
        label.push(`Answer ${i + 1}`)
      })

      const createDataSet = () => {
        /* To be used when needed more than 6 colors at random
        const red = Math.floor(Math.random() * 256);
        const green = Math.floor(Math.random() * 256);
        const blue = Math.floor(Math.random() * 256); */
        const colorVal = hexColors;
        return {
          label: 'answers',
          backgroundColor: colorVal,
          borderColor: colorVal,
          borderWidth: 1,
          hoverBackgroundColor: colorVal,
          hoverBorderColor: colorVal,
          // tslint:disable-next-line: prefer-array-literal
          data: new Array(numberOfAnswers).fill(0)
        }
      }

      graphData.labels = label;
      graphData.datasets.push(createDataSet())

      Object.keys(responseData.teams).forEach((team: string) => {
        if (teamId === 'all' || teamId === team) {
          responseData.teams[team].assessments.forEach((assessment: any) => {
            if (assessment && assessment.assessmentDetails) {
              // In assessmentDetails structure, questionIds are questionId and version concatenated ex: ques8010001_1
              const ques: string | undefined = Object.keys(assessment.assessmentDetails).find((q, i) => q.startsWith(question.id));
              if(ques) {
                if (assessment.assessmentDetails[ques].answers[0] != '@N/A') {
                  assessment.assessmentDetails[ques].answers.forEach((answer: string) => {
                    graphData.datasets[0].data[answerArray.indexOf(answer)] += 1;
                  })
                }
              }
            }
          })
        }
      })
    } catch (err) {
      console.log('Exception:', err);
    }
    return (graphData)
  }