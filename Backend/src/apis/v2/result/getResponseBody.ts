import { LevelAttributes } from '@models/index';
import { Result } from '@utils/index';

export interface AssessmentResultResponse {
  date: number;
  dateSubmit?: number;
  result: Result;
  suggestions: {};
  //    userLevels: {
  //        [level: string]: {
  //            lowerLimit: number;
  //            upperLimit: number;
  //        };
  //    };
  userLevels: LevelAttributes[];
}

export const determineUserLevel = (
  percentage: number,
  userLevels: any
): string => {
  let level: string = 'Not assigned';

  // tslint:disable-next-line: typedef
  userLevels.forEach((userLevel: LevelAttributes) => {
    // tslint:disable-next-line: typedef
    if (
      percentage >= userLevel.lowerLimit &&
      percentage <= userLevel.upperLimit
    ) {
      level = userLevel.name;
    }
  });

  return level;
};

export const calculatePercentage = (result: Result): number => {
  const { score, maxScore } = result;
  return Math.round((score / maxScore) * 100);
};

// export const getResponseBody = (assessmentDocument: AssessmentDocument): AssessmentResultResponse => {
//     const percentage: number = calculatePercentage(<Result>assessmentDocument.result);
//     const acknowledgement: AssessmentResultResponse = {
//         date: assessmentDocument.date,
//         result: <Result>{
//             ...assessmentDocument.result,
//             level: determineUserLevel(percentage),
//             percentage,
//         },
//         suggestions: {},
//         userLevels: config.userLevels,
//     };
//     return acknowledgement;
// };
