export interface Answer {
    answer: string;
    weightageFactor: number;
}

export interface Answers {
    [answerId: string]: Answer;
}

//Question will have id example: 'ques+uuid'
//Updating Question will create a new version
//Updating Question will change the lastModifiedOn and modifiedBy fields
export interface Question {
    active: boolean;
    answers: Answers;
    comments: string;
    createdByUser: string;
    createdOn: number;
    hint?: string;  //defaults
    hintURL?: string; //default
    id: string; // hash key
    lastModifiedOn: number;
    lastVersion: number;
    level?: string; // difficulty level of the question (low,med,hard)
    maxScore?: number;
    modifiedBy: string;
    NA?: string;  //default
    numberOfAnswers?: number;
    question: string;
    reason?: boolean;
    scoreObtained?: number;
    thresholdScore?: number;
    type: string;
    version: number;  // range key
}

export interface AssessmentQuestion extends Question {
    category?: string;
    randomize?: boolean;
}
