const axios = require('axios')
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
} = require('graphql')

const PlayerType = new GraphQLObjectType({
  name: 'Player',
  description: 'NFL player',
  fields: () => ({
    player_id: { type: GraphQLString },
    picked_by: { type: GraphQLString },
    round: { type: GraphQLString },
    draft_slot: { type: GraphQLString },
    // metadata: TODO
  })
})

const DraftType = new GraphQLObjectType({
  name: 'Draft',
  fields: () => ({
    draft_id: { type: GraphQLString },
    name: {
      type: GraphQLString,
      description: 'Name of the league for the given draft',
      resolve: (root, args) => {
        return root.metadata.name
      }
    },

    picks: {
      type: new GraphQLList(PlayerType),
      resolve: async (root, args) => {
        const { data } = await axios.get(`https://api.sleeper.app/v1/draft/${root.draft_id}/picks`)
        return data.filter(player => player.picked_by === root.user_id)
      }
    }
  })
})

const UserType = new GraphQLObjectType({
  name: 'User',
  description: 'Sleeper user',
  fields: () => ({
    username: { type: GraphQLString },
    user_id: { type: GraphQLString },
    display_name: { type: GraphQLString },
    avatar: { type: GraphQLString },
    drafts: {
      type: new GraphQLList(DraftType),
      resolve: async (root, args) => {
        const { data } = await axios.get(
          `https://api.sleeper.app/v1/user/${root.user_id}/drafts/nfl/2019`
        )
        return data.map(draft => ({
          ...draft,
          user_id: root.user_id
        }))
      }
    },
  })
})

const SleeperSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      user: {
        type: UserType,
        args: {
          username: { type: GraphQLString }
        },
        resolve: async (root, args) => {
          const { data } = await axios.get(`https://api.sleeper.app/v1/user/${args.username}`)
          return data
        }
      }
    }
  })
})

module.exports = SleeperSchema
