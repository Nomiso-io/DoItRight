import { IResponseData } from './common';

/** The intent for using this function is to filter out the content coming
 * from the reports api
 */

export const processAverageScore = (
  responseData: IResponseData,
  teamId: string
) => {
  let sum = 0;
  let total = 0;
  try {
    Object.keys(responseData.teams).forEach((team: string) => {
      if (teamId === 'all' || teamId === team) {
        responseData.teams[team].assessments.forEach((assessment: any) => {
          if (assessment && assessment.result && assessment.result.percentage) {
            sum = sum + assessment.result.percentage;
            total = total + 1;
          }
        });
      }
    });
    return {
      total,
      average: Math.round(sum / total),
    };
  } catch (err) {
    // console.log('Exception:', err);
    return { total: 0, average: 0 };
  }
};
