/// Import Library
const { ApolloServer } = require('apollo-server');
const mongoose = require('mongoose');
const { merge } = require('lodash');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { applyMiddleware } = require ('graphql-middleware');


/// Import Loader
const ingrLoader = require('./loader/ingredients.loader.js');


/// Import things from user
const { userTypeDefs } = require('./user/typedefs.js');
const { userResolvers } = require('./user/resolvers.js'); 
const { middleWare } = require('./user/auth');

/// Import things from ingredients
const { ingrResolvers } = require('./ingredients/resolvers.js');
const { ingrTypeDefs } = require('./ingredients/typedefs.js');

/// Import things from recipes
const { recipesResolvers } = require('./recipes/resolvers');
const { recipesTypeDefs } = require('./recipes/typedefs');

/// Merge typedefs
const typeDefs = [
  userTypeDefs,
  ingrTypeDefs,
  recipesTypeDefs

]

//// Merge resolvers
const resolvers = merge(
  userResolvers,
  ingrResolvers,
  recipesResolvers
)


/// Schema for apollo
const schema = makeExecutableSchema({ typeDefs, resolvers })
const schemaWithMiddleware = applyMiddleware(schema, ...middleWare )
const server = new ApolloServer({
    schema: schemaWithMiddleware,
    context: function({req}){
        return {ingrLoader,req}
    }  
})


/// function to start db and apollo server
async function start(typeDefs, resolvers){
    const url = 'localhost:27017';
    const portdb = 27017;
    const database = 'zettacamp';

// function connect to db
const connectDB = async () => {
    try {
      await mongoose.connect(`mongodb://${url}/${database}`);
      console.log(`Connected to ${database}: ${portdb}`);
    } catch (err) {
      console.log('Failed to connect to MongoDB', err);
    }
  }

  connectDB();
  await server.listen({ port: 4000 });
  console.log(`Connected to Server: 4000`);
  
}

/// Start the server
start(typeDefs,resolvers);


