import { connectionArgs } from 'graphql-relay';

import * as inputTypes from '../input-types';

import {
  CourseConnection,
  CourseUnitConnection,
  SectionCardConnection,
  UnitSectionConnection
} from '../../relay-models';

import { resolveCourses } from '../../relay-resolvers/course-resolvers';
import {
  resolveCourseUnits,
  resolveUserCourseUnitExamStatus
} from '../../relay-resolvers/course-unit-resolvers';
import { resolveUnitSections } from '../../relay-resolvers/unit-section-resolvers';
import { resolveSectionCards } from '../../relay-resolvers/section-card-resolvers';

export const coursePaging = {
  type: CourseConnection,
  description: 'all Courses in the database',
  args: {
    orderBy: {
      type: inputTypes.OrderByType
    },
    filterValues: {
      type: inputTypes.FilterValuesType
    },
    resolverArgs: {
      type: inputTypes.QueryResolverArgsType
    },
    ...connectionArgs
  },
  resolve: (obj, args, viewer, info) => resolveCourses(obj, args, viewer, info)
};

export const unitPaging = {
  type: CourseUnitConnection,
  description: 'all Units in the course',
  args: {
    orderBy: {
      type: inputTypes.OrderByType
    },
    filterValues: {
      type: inputTypes.FilterValuesType
    },
    resolverArgs: {
      type: inputTypes.QueryResolverArgsType
    },
    ...connectionArgs
  },
  resolve: (obj, args, viewer, info) =>
    resolveCourseUnits(obj, args, viewer, info)
};

export const userCourseUnitExamStatusPaging = {
  type: CourseUnitConnection,
  description: 'User exam status for Course',
  args: {
    orderBy: {
      type: inputTypes.OrderByType
    },
    filterValues: {
      type: inputTypes.FilterValuesType
    },
    resolverArgs: {
      type: inputTypes.QueryResolverArgsType
    },
    ...connectionArgs
  },
  resolve: (obj, args, viewer, info) =>
    resolveUserCourseUnitExamStatus(obj, args, viewer, info)
};

export const sectionPaging = {
  type: UnitSectionConnection,
  description: 'all Sections in the Unit',
  args: {
    orderBy: {
      type: inputTypes.OrderByType
    },
    filterValues: {
      type: inputTypes.FilterValuesType
    },
    resolverArgs: {
      type: inputTypes.QueryResolverArgsType
    },
    ...connectionArgs
  },
  resolve: (obj, args, viewer, info) =>
    resolveUnitSections(obj, args, viewer, info)
};

export const cardPaging = {
  type: SectionCardConnection,
  description: 'all Cards in the Section',
  args: {
    orderBy: {
      type: inputTypes.OrderByType
    },
    filterValues: {
      type: inputTypes.FilterValuesType
    },
    resolverArgs: {
      type: inputTypes.QueryResolverArgsType
    },
    ...connectionArgs
  },
  resolve: (obj, args, viewer, info) =>
    resolveSectionCards(obj, args, viewer, info)
};
