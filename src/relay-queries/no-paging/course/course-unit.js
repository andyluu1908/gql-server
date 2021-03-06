import { GraphQLString } from 'graphql';
import { CourseUnitType } from '../../../relay-models/course-unit';
import { resolveCourseUnit } from '../../../relay-resolvers/course-unit-resolvers';

export default {
  type: CourseUnitType,
  description: 'Course Unit',
  args: {
    course_id: {
      type: GraphQLString
    },
    unit_id: {
      type: GraphQLString
    }
  },
  resolve: (obj, args, viewer, info) =>
    resolveCourseUnit(obj, args, viewer, info)
};
