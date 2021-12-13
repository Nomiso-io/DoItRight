import {
    IAssessmentHistoryResponse,
    IAssessmentHistoryStoreFormat,
    IAssessmentListItem
} from '../../model'
export const mapAssessmentHistory =
    (response: IAssessmentHistoryResponse): IAssessmentHistoryStoreFormat => {
        const assessments = response.assessments;
        const modifiedAssessments = assessments.reduce((accumulator: any,
            currentValue: IAssessmentListItem) => {
            const assessmentId = currentValue['assessmentId'];
            accumulator[assessmentId] = currentValue;
            return accumulator;
        }, {})
        return {
            assessments: modifiedAssessments
        }
    }