import { fetchById, searchExamIdToTake } from '../db-handlers/exam-fetch';
import { fetchExamAttemptsByUserAndUnitJoinExam } from '../db-handlers/exam-attempt-fetch';
import { fromGlobalId } from 'graphql-relay';
import { logger } from '../utils/logger';

export const resolveExamToTake = async (obj, args, viewer, info) => {
  logger.debug(`in resolveExamToTake`);
  try {
    let course_id = fromGlobalId(args.course_id).id;
    let unit_id = fromGlobalId(args.unit_id).id;
    let exam_id = await searchExamIdToTake(unit_id, course_id, viewer, info);
    return fetchById(exam_id);
  } catch (error) {
    return Promise.reject(error);
  }
};
export const resolveExamAttempt = async (obj, args, viewer, info) => {
  logger.debug(`in resolveExamAttempt`);
  try {
    let unit_id = fromGlobalId(args.unit_id).id;
    return await fetchExamAttemptsByUserAndUnitJoinExam(
      viewer.user_id,
      unit_id
    );
  } catch (error) {
    return Promise.reject(error);
  }
};
