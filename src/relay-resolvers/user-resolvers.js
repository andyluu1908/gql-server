import { basicFind } from '../db-handlers/basic-query-handler';
import {
  fetchUserProfileById,
  fetchUserActivities
} from '../db-handlers/user/user-fetch';
import User from '../db-models/user-model';
import { mdbUserToGqlUser } from '../parsers/user-parser';
import { fromGlobalId } from 'graphql-relay';
import moment from 'moment';
import { logger } from '../utils/logger';

export const findUserById = async (user_id, viewer, info) => {
  logger.debug(`in findUserById`);
  let userRecord;
  try {
    //model, runParams, queryVal, sortVal, selectVal
    userRecord = await basicFind(User, { isById: true }, user_id);
  } catch (errInternalAlreadyReported) {
    return null;
  }

  try {
    userRecord = await mdbUserToGqlUser(userRecord, viewer);
  } catch (errInternalAlreadyReported) {
    return null;
  }

  return userRecord;
};

export const resolveUserProfile = async (obj, args, viewer, info) => {
  logger.debug(`in resolveUserProfile`);
  try {
    let userId =
      args && args.user_id ? fromGlobalId(userId).id : viewer.user_id;
    let userRecord = await fetchUserProfileById(userId, viewer);
    let locale = viewer.locale;
    return mdbUserToGqlUser(userRecord, { userId, locale });
  } catch (error) {
    return Promise.reject(error);
  }
};

export const resolveUserActivities = async (obj, args, viewer, info) => {
  logger.debug(`in resolveUserActivities`);
  if (!args || !args.start_date || !args.end_date) {
    return Promise.reject('start_date and end_date are required');
  }

  let startDate = moment(args.start_date, 'YYYY-MM-DD');
  let endDate = moment(args.end_date, 'YYYY-MM-DD');
  if (!startDate.isValid() || !endDate.isValid()) {
    return Promise.reject('start_date and/or end_date are not valid');
  }
  startDate = startDate.startOf('day');
  endDate = endDate.endOf('day');

  let userId =
    args && args.user_id ? fromGlobalId(args.user_id).id : viewer.user_id;

  try {
    return await fetchUserActivities(
      userId,
      startDate.toDate(),
      endDate.toDate()
    );
  } catch (error) {
    return Promise.reject(error);
  }
};
