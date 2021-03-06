import { GraphQLNonNull, GraphQLObjectType } from 'graphql';

import { connectionDefinitions, globalIdField } from 'graphql-relay';

import { EmbeddedDocRefRecordConnection } from './embedded-doc-ref-record';
import { NodeInterface } from './node-definitions';

export const EmbeddedDocRefType = new GraphQLObjectType({
  name: 'EmbeddedDocRef',
  description: '',
  fields: () => ({
    id: globalIdField('EmbeddedDocRef', obj => obj._id),
    embedded_doc_refs: {
      type: new GraphQLNonNull(EmbeddedDocRefRecordConnection)
    }
  }),
  interfaces: [NodeInterface]
});

export const {
  connectionType: EmbeddedDocRefConnection
} = connectionDefinitions({
  name: 'EmbeddedDocRef',
  nodeType: EmbeddedDocRefType
});
