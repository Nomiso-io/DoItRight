import { IResponseData } from '../common/common';
import { IBarDisplayData } from './bar';

export const processBarGraphData = (
  responseData: IResponseData,
  teamId: string
) => {
  /** Creating a new bar chart data variable,
   * this type of structure is needed by the bar chart
   * Component
   */
  const barData: IBarDisplayData = {
    labels: [],
    datasets: [],
  };

  try {
    /** This string array contains user level strings ex: '0-25', '26-50' */
    //    const userLevelStrings: string[] = [];
    const categoryList = Object.keys(responseData.categoryList);
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
          const markLevel = (percentage: number, categoryIndex: number) => {
            sortedUserLevels.forEach((el: string, i: number) => {
              if (percentage >= responseData.userLevels[el].lowerLimit &&
                percentage <= responseData.userLevels[el].upperLimit) {
                barData.datasets[i].data[categoryIndex] =
                  barData.datasets[i].data[categoryIndex] + 1;
              }
            })
          }
    */
    /** Sorting the user levels as they can come in any order */
    const sortedUserLevels = responseData.userLevels.sort((a: any, b: any) => {
      return a.lowerLimit > b.lowerLimit ? 1 : -1;
    });

    /** This function is used to tally the levels */
    const markLevel = (percentage: number, categoryIndex: number) => {
      sortedUserLevels.forEach((el: any, i: number) => {
        if (percentage >= el.lowerLimit && percentage <= el.upperLimit) {
          barData.datasets[i].data[categoryIndex] =
            barData.datasets[i].data[categoryIndex] + 1;
        }
      });
    };

    /** This function creates a data set for the bar data, dataSet is set of data
     * Used to represent data regarding the y-axis of the bar
     */
    //    const createDataSet = (el: string, i: number) => {
    const createDataSet = (el: any) => {
      /* To be used when needed more than 6 colors at random
      const red = Math.floor(Math.random() * 256);
      const green = Math.floor(Math.random() * 256);
      const blue = Math.floor(Math.random() * 256); */
      //      const backgroundColorVal = `rgba(${rgbColors[i].red.toString()}, ${rgbColors[i].green.toString()}, ${rgbColors[i].blue.toString()},1)`;
      //      const borderColorVal = `rgba(${rgbColors[i].red.toString()}, ${rgbColors[i].green.toString()}, ${rgbColors[i].blue.toString()},1)`;
      //      const hoverBackgroundColorVal = `rgba(${rgbColors[i].red.toString()}, ${rgbColors[i].green.toString()}, ${rgbColors[i].blue.toString()},1)`
      //      const hoverBorderColorVal = `rgba(${rgbColors[i].red.toString()}, ${rgbColors[i].green.toString()}, ${rgbColors[i].blue.toString()},1)`
      const backgroundColorVal = el.color;
      const borderColorVal = el.color;
      const hoverBackgroundColorVal = el.color;
      const hoverBorderColorVal = el.color;
      const str = `${
        el.name
      }(${el.lowerLimit.toString()}-${el.upperLimit.toString()})`;
      //      userLevelStrings.push(str);
      return {
        label: str,
        backgroundColor: backgroundColorVal,
        borderColor: borderColorVal,
        borderWidth: 1,
        hoverBackgroundColor: hoverBackgroundColorVal,
        hoverBorderColor: hoverBorderColorVal,
        // tslint:disable-next-line: prefer-array-literal
        data: new Array(categoryList.length).fill(0),
      };
    };

    /** Creating n array of user level strings ex: ['0-25', '26-50'] */
    sortedUserLevels.forEach((el: any) => {
      barData.datasets.push(createDataSet(el));
    });

    /** Copying the value of categoryList in labels */
    barData['labels'] = categoryList;
    /** Initializing datasets for the number of User Levels */
    //    userLevelStrings.forEach((el: string, i: number) => {
    //      barData.datasets.push(createDataSet(el, i))
    //    })

    /** Traversing the assessments and calculating the graph data */
    categoryList.forEach((el: string, index: number) => {
      Object.keys(responseData.teams).forEach((team: string) => {
        if (teamId === 'all' || teamId === team) {
          responseData.teams[team].assessments.forEach((assessment: any) => {
            if (
              assessment &&
              assessment.result &&
              assessment.result.categoryWiseResults &&
              assessment.result.categoryWiseResults[el]
            ) {
              markLevel(
                assessment.result.categoryWiseResults[el].percentage,
                index
              );
            }
          });
        }
      });
    });
  } catch (err) {
    console.error('Exception:', err);
  }
  return barData;
};
