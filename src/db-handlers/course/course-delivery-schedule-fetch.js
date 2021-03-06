import { logger } from '../../utils/logger';
import { basicFind } from '../basic-query-handler';
import CourseDelivery from '../../db-models/course-delivery-model';
import { fetchByKey } from '../user/user-fetch';
import { getStringByLocale } from '../../parsers/intl-string-parser';

export const fetchByCourseIdAndLocale = async (
  course_id,
  locale,
  selectVal
) => {
  let record;
  try {
    record = await basicFind(
      CourseDelivery,
      { isOne: true },
      { course_id: course_id, locale: locale },
      null,
      selectVal
    );
  } catch (errInternalAlreadyReported) {
    return null;
  }
  return record;
};

/*
Returns ONE (active) Schedule that is applicable to ANY of the Delivery Methods passed in
Start Dates sorted in ascending order (earliest to latest), equal or later to the date passed in
 */
export const fetchCourseDeliverySchedule = async (
  course_id,
  delivery_methods,
  date_on_or_after,
  viewer,
  info
) => {
  logger.debug(`in fetchCourseDeliverySchedule`);
  // logger.debug(`   course_id ` + course_id);
  const selectVal = {
    instructors: 1,
    delivery_structures: 1
  };
  let courseDeliveryRecord = await fetchByCourseIdAndLocale(
    course_id,
    viewer.locale,
    selectVal
  );
  logger.debug(` courseDeliveryRecord ` + courseDeliveryRecord);

  if (!(courseDeliveryRecord && courseDeliveryRecord.delivery_structures)) {
    return {};
  }

  let result = {};

  const courseInstructors =
    courseDeliveryRecord.instructors &&
    courseDeliveryRecord.instructors.length > 0
      ? courseDeliveryRecord.instructors
      : [];
  // logger.debug(` courseInstructors ` + courseInstructors);

  for (let deliveryStruct of courseDeliveryRecord.delivery_structures) {
    if (
      !delivery_methods.some(r => deliveryStruct.delivery_methods.includes(r))
    ) {
      continue;
    }
    result.delivery_methods = deliveryStruct.delivery_methods;
    result.delivery_structure = deliveryStruct.delivery_structure;
    result.course_duration = loadDuration(deliveryStruct.course_duration);

    let deliveryStructInstructors =
      deliveryStruct.instructors && deliveryStruct.instructors.length > 0
        ? deliveryStruct.instructors
        : courseInstructors;

    const genSessionDuration = loadDuration(deliveryStruct.session_duration);

    const session_info = [];
    for (let deliverySession of deliveryStruct.sessions) {
      deliverySession.session_duration = isDuration(
        deliverySession.session_duration
      )
        ? loadDuration(deliverySession.session_duration)
        : genSessionDuration;

      session_info.push(deliverySession);
    }

    result.session_info = session_info;

    const scheduled_runs = [];
    const sortedScheduledRuns = deliveryStruct.scheduled_runs.sort(
      (it1, it2) => it1.run_start_date - it2.run_start_date
    );
    for (let scheduledRun of sortedScheduledRuns) {
      if (!scheduledRun.active) {
        continue;
      }
      if (scheduledRun.run_start_date < date_on_or_after) {
        continue;
      }

      let scheduledRunInstructors =
        scheduledRun.instructors && scheduledRun.instructors.length > 0
          ? scheduledRun.instructors
          : deliveryStructInstructors;

      const instructorObjArray = [];
      const run_sessions = [];
      const sortedSchedRunSessions = scheduledRun.sessions.sort(
        (it1, it2) => it1.session_seq - it2.session_seq
      );
      for (let schedRunSession of sortedSchedRunSessions) {
        logger.debug(` schedRunSession ` + JSON.stringify(schedRunSession));

        const thisSessionInfo = session_info.find(
          obj => obj.session_seq === schedRunSession.session_seq
        );
        logger.debug(` thisSessionInfo ` + JSON.stringify(thisSessionInfo));

        if (
          !(
            schedRunSession.instructors &&
            schedRunSession.instructors.length > 0
          )
        ) {
          schedRunSession.instructors =
            thisSessionInfo &&
            thisSessionInfo.instructors &&
            thisSessionInfo.instructors.length > 0
              ? thisSessionInfo.instructors
              : scheduledRunInstructors;
        }

        if (!isDuration(schedRunSession.session_duration)) {
          schedRunSession.session_duration = thisSessionInfo
            ? thisSessionInfo.session_duration
            : genSessionDuration;
        }
        logger.debug(
          ` schedRunSession updated ` + JSON.stringify(schedRunSession)
        );

        const sessionInstructors = [];
        for (let instructorId of schedRunSession.instructors) {
          const thisInstructor = instructorObjArray.find(
            obj => obj.username === instructorId
          );
          if (thisInstructor) {
            sessionInstructors.push(thisInstructor);
          } else {
            const instrObj = {
              username: instructorId,
              full_name: '',
              primary_email: ''
            };
            const fetchedInstr = await fetchByKey(
              { username: instructorId },
              { full_name: 1, primary_email: 1 },
              viewer,
              info
            );
            if (fetchedInstr) {
              logger.debug(` fetchedInstr ` + fetchedInstr);
              // instrObj.primary_email = fetchedInstr.primary_email;
              instrObj.full_name = getStringByLocale(
                fetchedInstr.full_name,
                viewer.locale
              ).text;
            }
            logger.debug(` instrObj ` + JSON.stringify(instrObj));
            sessionInstructors.push(instrObj);
            instructorObjArray.push(instrObj);
          }
        }

        const run_sessions_output = {
          session_seq: schedRunSession.session_seq,
          session_start_date: schedRunSession.session_start_date,
          instructors: sessionInstructors,
          session_duration: schedRunSession.session_duration
        };

        run_sessions.push(run_sessions_output);
      }

      scheduledRun.run_sessions = run_sessions;
      scheduled_runs.push(scheduledRun);
    }

    result.scheduled_runs = scheduled_runs;
  }
  logger.debug(` result ` + JSON.stringify(result));
  return result;
};

export const fetchCourseDeliveryMethods = async (course_id, viewer, info) => {
  logger.debug(`in fetchCourseDeliverySchedule`);
  logger.debug(` result ` + result);
  let result = [];
  const selectVal = {
    available_delivery_methods: 1
  };
  let courseDeliveryRecord = await fetchByCourseIdAndLocale(
    course_id,
    viewer.locale,
    selectVal
  );
  if (courseDeliveryRecord && courseDeliveryRecord.available_delivery_methods) {
    result = courseDeliveryRecord.available_delivery_methods;
  }
  return result;
};

const loadDuration = s => {
  const result = {
    months: 0,
    weeks: 0,
    days: 0,
    hours: 0,
    minutes: 0
  };
  if (s) {
    if (s.months) {
      result.months = s.months;
    }
    if (s.weeks) {
      result.weeks = s.weeks;
    }
    if (s.days) {
      result.days = s.days;
    }
    if (s.hours) {
      result.hours = s.hours;
    }
    if (s.minutes) {
      result.minutes = s.minutes;
    }
  }
  return result;
};

const isDuration = s => {
  if (s && (s.months || s.weeks || s.days || s.hours || s.minutes)) {
    return true;
  }
  return false;
};
