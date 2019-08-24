const app = require('express')()
const graphqlHTTP = require('express-graphql')
const SleeperSchema = require('./schemas')

app.use('/graphql', graphqlHTTP({
  schema: SleeperSchema,
  graphiql: true,
}))

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the SleeperSquads API!'
  })
})

module.exports = app
