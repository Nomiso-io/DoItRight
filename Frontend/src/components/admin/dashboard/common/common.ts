export const rgbColors = [
  {
    red: 68,
    green: 114,
    blue: 197,
  },
  {
    red: 237,
    green: 127,
    blue: 54,
  },
  {
    red: 165,
    green: 165,
    blue: 165,
  },
  {
    red: 254,
    green: 194,
    blue: 57,
  },
  {
    red: 55,
    green: 162,
    blue: 235,
  },
];

//export const hexColors = ['#72AADB', '#EA8B49', '#B2B2B2', '#FEC239', '#5C82C9', '#8e5ea2', '#3cba9f', '#c45850', '#ED7F36', '#e8c3b9'];
//export const hexColors = ['#949494', '#FDE59D', '#FFBF00', '#90EE90', '#099441', '#014E20', '#014A4E', '#011B3A', '#0B0179', '#4A02BF'];
export const hexColors = [
  '#A3D4FE',
  '#5CB3FE',
  '#0E88F1',
  '#036ECA',
  '#025296',
  '#013969',
  '#01294C',
  '#060E77',
  '#393D79',
  '#4F5167',
];

export interface IResponseData {
  teams: any;
  userLevels: any;
  categoryList: {
    [key: string]: number;
  };
  questionsDetails: any;
  weightageCoefficient: number;
}

export const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
