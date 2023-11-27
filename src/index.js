import { GraphQLServer } from "graphql-yoga";
import db from "./db.js";
import Query from "./resolvers/Query.js";
import Mutation from "./resolvers/Mutation.js";
import Post from "./resolvers/Post.js";
import User from "./resolvers/User.js";
import Comment from "./resolvers/Comment.js";

const server = new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers: {
        Query, 
        Mutation, 
        User, 
        Post, 
        Comment
    },
    // context will pass the objects to any resolvers 
    context: {
        db
    }
})

server.start(() => {
    console.log("The server is up!")
})
