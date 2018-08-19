import Course from '../../db-models/course-model';
import ListDef from '../../db-models/list-def-model';
import * as projectionWriter from '../../utils/projection-writer';
import { basicFind } from '../../db-handlers/basic-query-handler';
import { getStringByLocale } from '../../parsers/intl-string-parser';
import CardInteraction from '../../db-models/card-interaction-model';
import { logger } from '../../utils/logger';

export const findById = async (obj_id, viewer, info) => {
  logger.debug(`in Course findById`);
  let record;
  try {
    //model, runParams, queryVal, sortVal, selectVal
    record = await basicFind(
      Course,
      {
        isById: true
      },
      obj_id
    );
  } catch (errInternalAllreadyReported) {
    return null;
  }
  return record;
};

/**
 * Fetch Courses with filters and paging
 * @param {object} filterValues Contains `filterValuesString` as a free-form string
 *   to be used as a MDB expression in the $match operation
 * @param {array} aggregateArray Contains `$sort`, `$skip` and `$limit` object for the MDB query
 * @param {string} viewerLocale Locale of the current user to get text from Intl object
 * @param {object} fetchParameters Conditions to filter and display the courses list
 *   {array} courseIds: Fetch only the courses within the given `_id` list
 *   {string} userId: Lookup for the enrolled users
 *   {boolean} mine: Whether to fetch only user's courses, sort by last accessed time
 *   {string} roles: Require `mine` param. List of user roles on the course, separated by comma
 *   {boolean} relevant: Whether to fetch all courses but show user's courses first then the others
 *   {boolean} trending: Whether to fetch all courses and sort by enrolled count
 *   {string} topic: Topic value to filter out the courses
 * @return {Promise} The list of filtered courses on success, Promise.reject on error.
 */
export const fetchCourses = async (
  filterValues,
  aggregateArray,
  viewerLocale,
  fetchParameters
) => {
  logger.debug(`in fetchCourses`);
  let courseFields = {
    subscription_level: 1,
    enrolled_count: 1,
    verified_cert_cost: 1,
    skill_level: 1,
    est_minutes: 1,
    primary_topic: 1,
    view_count: 1,
    logo_url: 1,
    _id: 1
  };
  let intlStringFields = {
    title: 1,
    headline: 1,
    description: 1
  };

  // TODO: find easier way for custom sort...
  // let sort = aggregateArray.find(item => !!item.$sort);
  let sort = {
    $sort: {
      title: 1
    }
  };
  let skip = aggregateArray.find(item => !!item.$skip);
  let limit = aggregateArray.find(item => !!item.$limit);

  let array = [];

  if (fetchParameters.courseIds) {
    array.push({
      $match: {
        _id: {
          $in: fetchParameters.courseIds
        }
      }
    });
  }

  if (fetchParameters.userId) {
    array.push({
      $lookup: {
        from: 'user',
        localField: '_id',
        foreignField: 'course_roles.course_id',
        as: 'users'
      }
    });
    array.push({
      $project: {
        ...intlStringFields,
        ...courseFields,
        users: {
          $filter: {
            input: '$users',
            cond: {
              $eq: ['$$this._id', fetchParameters.userId]
            }
          }
        }
      }
    });
  }

  if (fetchParameters.mine) {
    array.push({
      $unwind: '$users'
    });
    array.push({
      $project: {
        ...intlStringFields,
        ...courseFields,
        'users.course_roles': {
          $filter: {
            input: '$users.course_roles',
            cond: {
              $eq: ['$$this.course_id', '$_id']
            }
          }
        }
      }
    });

    // filter courses by user roles
    if (fetchParameters.roles) {
      array.push({
        $match: {
          'users.course_roles.role': {
            $elemMatch: {
              $in: fetchParameters.roles.split(',')
            }
          }
        }
      });
    }

    array.push({
      $addFields: {
        last_accessed_at: '$users.course_roles.last_accessed_at'
      }
    });
    courseFields.last_accessed_at = 1;

    sort = {
      $sort: {
        last_accessed_at: -1
      }
    };
  }

  if (fetchParameters.relevant) {
    array.push({
      $project: {
        ...intlStringFields,
        ...courseFields,
        my_course: {
          $size: '$users'
        }
      }
    });
    courseFields.my_course = 1;

    sort = {
      $sort: {
        my_course: -1,
        title: 1
      }
    };
  }

  if (fetchParameters.trending) {
    array.push({
      $project: {
        ...intlStringFields,
        ...courseFields
      }
    });
    sort = {
      $sort: {
        enrolled_count: -1,
        title: 1
      }
    };
  }

  if (fetchParameters.topic) {
    array.push({
      $match: {
        topics: fetchParameters.topic
      }
    });
  }

  array.push({
    $project: {
      ...courseFields,
      'title.intlString': projectionWriter.writeIntlStringFilter(
        'title',
        viewerLocale
      ),
      'headline.intlString': projectionWriter.writeIntlStringFilter(
        'headline',
        viewerLocale
      ),
      'description.intlString': projectionWriter.writeIntlStringFilter(
        'description',
        viewerLocale
      )
    }
  });
  array.push({
    $project: {
      ...courseFields,
      title: projectionWriter.writeIntlStringEval('title', viewerLocale),
      headline: projectionWriter.writeIntlStringEval('headline', viewerLocale),
      description: projectionWriter.writeIntlStringEval(
        'description',
        viewerLocale
      )
    }
  });

  if (filterValues) {
    try {
      const objectFilter = JSON.parse(filterValues.filterValuesString);
      array.push({
        $match: objectFilter
      });
      sort = {
        $sort: {
          title: 1
        }
      };
    } catch (error) {
      return Promise.reject(error);
    }
  }

  if (sort) array.push(sort);
  if (skip) array.push(skip);
  if (limit) array.push(limit);

  const result = await Course.aggregate(array).exec();
  for (let item of result) {
    item.logo_url =
      item.logo_url ||
      'http://drive.edge-works.net/index.php/s/Cql8UefvAA20rXi/download';
  }
  return result;
};
export const fetchCourseUnitWithSummary = async (obj_id, viewer, info) => {
  logger.debug(`in fetchCourseUnitWithSummary`);
  const array = [
    {
      $match: {
        _id: obj_id
      }
    },
    {
      $project: {
        units: '$units.Units'
      }
    },
    {
      $unwind: '$units'
    },
    {
      $project: {
        'units._id': 1,
        'units.attempts_allowed_per_day': 1
      }
    },
    {
      $lookup: {
        from: 'exam_attempt',
        localField: 'units._id',
        foreignField: 'course_unit_id',
        as: 'exam_attempt'
      }
    },
    {
      $project: {
        exam_attempt: {
          $filter: {
            input: '$exam_attempt',
            cond: {
              $eq: ['$$this.user_id', viewer.user_id]
            }
          }
        },
        count_exam: {
          $size: '$exam_attempt'
        },
        'units.attempts_allowed_per_day': 1
      }
    },
    {
      $project: {
        total: {
          $subtract: ['$units.attempts_allowed_per_day', '$count_exam']
        }
      }
    }
  ];
  return await Course.aggregate(array).exec();
};
export const fetchTopic = async (obj_id, viewer, info) => {
  logger.debug(`in fetchTopic`);
  let array = [
    {
      $match: {
        type: 'topic'
      }
    },
    {
      $project: {
        value: 1
      }
    }
  ];
  return await ListDef.aggregate(array).exec();
};
export const fetchCourseEntry = async (course_id, viewer, info) => {
  logger.debug(`in fetchCourseEntry`);
  let courseRecord = await findById(course_id, viewer, info);
  courseRecord = courseRecord.toObject();
  courseRecord.title = getStringByLocale(
    courseRecord.title,
    viewer.locale
  ).text;
  courseRecord.headline = getStringByLocale(
    courseRecord.headline,
    viewer.locale
  ).text;
  courseRecord.description = getStringByLocale(
    courseRecord.description,
    viewer.locale
  ).text;
  courseRecord.info_md = getStringByLocale(
    courseRecord.info_md,
    viewer.locale
  ).text;
  try {
    const lastAccessRefsResp = await CardInteraction.findOne({
      user_id: viewer.user_id,
      'card_ref.EmbeddedDocRef.embedded_doc_refs.0.doc_id': courseRecord._id
    })
      .sort({ updated_at: -1 })
      .exec();
    courseRecord.last_accessed_card = lastAccessRefsResp.card_id;
    const lastAccessRefs =
      lastAccessRefsResp.card_ref.EmbeddedDocRef.embedded_doc_refs;
    lastAccessRefs.forEach(ref => {
      switch (ref.level) {
        case 'unit':
          courseRecord.last_accessed_unit = ref.doc_id;
          break;
        case 'section':
          courseRecord.last_accessed_section = ref.doc_id;
          break;
      }
    });
  } catch (err) {
    courseRecord.last_accessed_unit = '';
    courseRecord.last_accessed_section = '';
    courseRecord.last_accessed_card = '';
  }
  return courseRecord;
};
