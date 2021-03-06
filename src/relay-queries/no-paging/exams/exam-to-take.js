import { GraphQLString } from 'graphql';
import { ExamType } from '../../../relay-models/exam';
import { resolveExamToTake } from '../../../relay-resolvers/exam-resolvers';

export default {
  type: ExamType,
  args: {
    unit_id: {
      type: GraphQLString
    },
    course_id: {
      type: GraphQLString
    }
  },
  resolve: resolveExamToTake
};
