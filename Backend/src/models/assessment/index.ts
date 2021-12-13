export interface Result {
    assessmentId: string;
    date: number;
    result: {
        maxScore: number;
        score: number;
    };
}
