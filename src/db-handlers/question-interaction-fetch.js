import { basicFind } from '../db-handlers/basic-query-handler';
import QuestionInteraction from '../db-models/question-interaction-model.js';
import { logger } from '../utils/logger';

export const findById = async (obj_id, viewer, info) => {
  logger.debug(`in Quest Interact findById`);
  let record;
  try {
    //model, runParams, queryVal, sortVal, selectVal
    record = await basicFind(QuestionInteraction, { isById: true }, obj_id);
  } catch (errInternalAllreadyReported) {
    return null;
  }
  return record;
};

export const findByQuestionIds = async (
  userId,
  quesIds,
  type = null,
  opts = {}
) => {
  try {
    let conditions = { user_id: userId, question_id: { $in: quesIds } };
    if (type) {
      conditions.exam_type = type;
    }
    if (!opts.includeEmpty) {
      conditions.response_data = { $exists: true, $ne: null };
    }

    let query = QuestionInteraction.find(conditions);
    if (opts.sort) {
      query = query.sort(opts.sort);
    }
    if (opts.limit) {
      query = query.limit(opts.limit);
    }

    return await query.exec();
  } catch (error) {
    return [];
  }
};

export const getUserAnswer = async (exam_attempt_id, question_id, user_id) => {
  logger.debug(`in Quest Interact getUserAnswer`);
  const record = await basicFind(
    QuestionInteraction,
    { isOne: true },
    {
      user_id,
      question_id,
      exam_attempt_id
    }
  );
  return record ? record.response_data : null;
};
