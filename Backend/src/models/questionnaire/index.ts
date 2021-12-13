export interface Questionnaire {
  active?: boolean;
  benchmarkScore?: number;
  categories?: string[];
  categoriesMap: CategoriesMap;
  createdBy?: string;
  createdOn: number;
  description?: string;
  hideResult?: boolean;
  lastVersion?: string;
  modifiedBy?: string;
  modifiedOn?: number;
  name: string;
  publishedBy?: string;
  publishedOn?: number;
  questionnaireId: string;
  questions: string[];
  randomize?: boolean;
  showRecommendations?: boolean;
  timeOut?: boolean;
  timeOutTime?: number;
  version: string;
  warningTimePercentage?: number;
}

export interface CategoriesMap {
  [questionId: string]: string;
}
