import { IResponseData } from '../common/common';
import { IPieDisplayData } from './pie';

export const processPieChartData = (
  responseData: IResponseData,
  teamId: string
) => {
  /** Creating a new pie chart data variable,
   * this type of structure is needed by the pie chart
   * Component
   */
  const pieData: IPieDisplayData = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
        hoverBackgroundColor: [],
      },
    ],
  };
  try {
    /** This string array contains user level strings ex: '0-25', '26-50' */
    const userLevelStrings: string[] = [];

    /*
          const sortedUserLevels = Object.keys(responseData.userLevels);
          /** Sorting the user levels as they can come in any order * /
          sortedUserLevels.sort((a: any, b: any) => {
            return responseData.userLevels[a].lowerLimit > responseData.userLevels[b].lowerLimit ? 1 : -1
          })
          /** Creating n array of user level strings ex: ['0-25', '26-50'] * /
          sortedUserLevels.forEach((el) => {
            const str = `${el}(${responseData.userLevels[el].lowerLimit.toString()}-${responseData.userLevels[el].upperLimit.toString()})`;
            userLevelStrings.push(str)
          })
    
          /** This function is used to tally the levels * /
          const markLevel = (percentage: number) => {
            sortedUserLevels.forEach((el: string, i: number) => {
              if (percentage >= responseData.userLevels[el].lowerLimit &&
                percentage <= responseData.userLevels[el].upperLimit) {
                pieData.datasets[0].data[i] =
                  pieData.datasets[0].data[i] + 1;
              }
            })
          }
    */
    /** Sorting the user levels as they can come in any order */
    const sortedUserLevels = responseData.userLevels.sort((a: any, b: any) => {
      return a.lowerLimit > b.lowerLimit ? 1 : -1;
    });
    /** Creating n array of user level strings ex: ['0-25', '26-50'] */
    sortedUserLevels.forEach((el: any) => {
      const str = `${
        el.name
      }(${el.lowerLimit.toString()}-${el.upperLimit.toString()})`;
      userLevelStrings.push(str);
      pieData.datasets[0].backgroundColor.push(el.color);
      pieData.datasets[0].hoverBackgroundColor.push(el.color);
    });

    /** This function is used to tally the levels */
    const markLevel = (percentage: number) => {
      sortedUserLevels.forEach((el: any, i: number) => {
        if (percentage >= el.lowerLimit && percentage <= el.upperLimit) {
          pieData.datasets[0].data[i] = pieData.datasets[0].data[i] + 1;
        }
      });
    };

    /** Initialising the pie display data structure*/
    pieData['labels'] = userLevelStrings;
    pieData.datasets[0].data = new Array(userLevelStrings.length).fill(0);
    /** Initialising dataset * /
    userLevelStrings.forEach((el: string, i: number) => {
      const colorVal = `rgba(${rgbColors[i].red.toString()}, ${rgbColors[
        i
      ].green.toString()}, ${rgbColors[i].blue.toString()},1)`;
      pieData.datasets[0].backgroundColor.push(colorVal);
      pieData.datasets[0].hoverBackgroundColor.push(colorVal);
    });
    */

    /** Traversing the assessments and calculating the pie chart data */
    Object.keys(responseData.teams).forEach((team: string) => {
      if (teamId === 'all' || teamId === team) {
        responseData.teams[team].assessments.forEach((assessment: any) => {
          if (assessment && assessment.result && assessment.result.percentage) {
            markLevel(assessment.result.percentage);
          }
        });
      }
    });
  } catch (err) {
    console.error('Exception:', err);
  }
  return pieData;
};
