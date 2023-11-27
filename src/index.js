import { GraphQLServer } from "graphql-yoga";
import uuidv4 from "uuid";
import db from "./db.js";

/**
 * Key Points for Query: 
 * 1) There must be schema 
 * 2) You can query scalar types directly (String, Boolean, Int, Float, ID)
 * 3) For non-scalar types, you have to set up resolver function 
 * Key Points for Mutation: 
 * 1. Mutation: allows you to update/delete data on the server, e.g. sign up form
 * 2. Client to define the mutation schema; server to define the mutation resolver 
 */

// Resolvers 
const resolvers = {
    Query: {
        // destructure context argument to {db}
        users(parent, args, {db}, info) {
            if (!args.query) {
                return db.users
            }
            return db.users.filter((user) => {
                return user.name.toLowerCase().includes(args.query.toLowerCase())
            })
        },
        posts(parent, args, {db}, info) {
            if (!args.query) {
                return db.posts
            } 
            return db.posts.filter((post) => {
                return post.title.toLowerCase().includes(args.query.toLowerCase())
            })
        }, 
        comments(parent, args, {db}, info) {
            return db.comments
        }
    },
    // Define the Mutation on the server 
    Mutation: {
        createUser(parent, args, {db}, info) {
            const emailTaken = db.users.some((user) => user.email === args.data.email)
            if (emailTaken) {
                throw new Error('Error: Email is already taken. ')
            }
            const user = {
                id: uuidv4(),
                ...args.data
            }
            db.users.push(user)
            return user
        },
        deleteUser(parent, args, {db}, info) {
            const userIndex = db.users.findIndex(user => user.id === args.id)
            if (userIndex === -1) {
                throw new Error("User not found")
            }
            const deletedUsers = db.users.splice(userIndex, 1)
            // remove all the posts of the user
            db.posts = db.posts.filter((post) => {
                const match = post.author === args.id
                if (match) {
                    // delete all the associated comments for the given post 
                    db.comments = db.comments.filter((comment) => comment.post !== post.id)
                }
                return !match
            })
            // remove all the comments of the user
            db.comments = db.comments.filter((comment) => comment.author !== args.id)
            return deletedUsers[0]
        },
        createPost(parent, args, {db}, info) {
            const userExists = db.users.some((user) => user.id === args.data.author)
            if (!userExists) {
                throw new Error('User not found')
            }
            const post = {
                id: uuidv4(), 
                ...args.data
            }
            db.posts.push(post)
            return post
        }, 
        deletePost(parent, args, {db}, info) {
            const postIndex = db.posts.findIndex(post => post.id === args.id)
            if (postIndex === -1) {
                throw new Error("Post not found")
            }
            const deletedPosts = db.posts.splice(postIndex, 1)
            db.comments = db.comments.filter((comment) => comment.post !== args.id)
            return deletedPosts[0]
        },
        createComment(parent, args, {db}, info) {
            const userExists = db.users.some((user) => user.id === args.data.author)
            if (!userExists) {
                throw new Error("User not found")
            }
            const postValidated = db.posts.some((post) => (post.id === args.data.post && post.published))
            if (!postValidated) {
                throw new Error('Post is not valid.')
            }
            const comment = {
                commentId: uuidv4(),
                ...args.data
            }
            db.comments.push(comment)
            return comment
        },
        deleteComment(parent, args, {db}, info) {
            const commentIndex = db.comments.findIndex(comment => comment.commentId === args.id)
            if (commentIndex === -1) {
                throw new Error("Comment not found")
            }
            const deletedComments = db.comments.splice(commentIndex, 1)
            return deletedComments[0]
        }
    },
    // For non-scalar field, we have to set up resolver function 
    // objects outside Query
    Post: {
        author(parent, args, {db}, info) {
            return db.users.find((user) => {
                return user.id === parent.author
            })
        },
        comments(parent, args, {db}, info) {
            return db.comments.filter((comment) => {
                return comment.post === parent.id
            })
        }
    },
    User: {
        posts(parent, args, {db}, info) {
            return db.posts.filter((post) => {
                return post.author === parent.id
            })
        },
        comments(parent, args, {db}, info) {
            return db.comments.filter((comment) => {
                return comment.author === parent.id
            })
        }
    },
    Comment: {
        author(parent, args, {db}, info) {
            return db.users.find((user) => {
                return user.id === parent.author
            })
        }, 
        post(parent, args, {db}, info) {
            return db.posts.find((post) => {
                return post.id === parent.post
            })
        }
    }
}

const server = new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers: resolvers,
    // context will pass the objects to any resolvers 
    context: {
        db
    }
})

server.start(() => {
    console.log("The server is up!")
})
