import { GraphQLServer } from "graphql-yoga";
import uuidv4 from "uuid";

/**
 * Key Points: 
 * 1. Mutation: allows you to update/delete data on the server, e.g. sign up form
 * 2. Client to define the mutation schema; server to define the mutation resolver 
 */
const users = [{
    id: '1',
    name: "Ann",
    email: "a@example.com",
    age: 12,
}, {
    id: '2',
    name: "Bob",
    email: "b@example.com",
    age: 10,
}, {
    id: '3',
    name: "Cathy",
    email: "c@example.com",
    age: 9,
}]
const posts = [{
    id: '1',
    title: 'today is a good day',
    body: 'test',
    published: true,
    author: '1',
}, {
    id: '2',
    title: 'yesterday is a good day',
    body: 'test',
    published: true,
    author: '1'
}, {
    id: '3',
    title: 'tommorrow is a good day',
    body: 'test',
    published: false,
    author: '2'
}]

const comments = [{
    commentId: '1',
    text: 'do you believe it?',
    author: '3',
    post: '1'
}, {
    commentId: '2',
    text: 'i do not believe it',
    author: '1',
    post: '2'
}, {
    commentId: '3',
    text: 'you should be positive',
    author: '2',
    post: '3'
}, {
    commentId: '4',
    text: 'trust yourself.',
    author: '2',
    post: '3'
}]
// Type definition (schema) on the client
const typeDefs = `
    type Query {
        users(query: String): [User!]!
        posts(query: String): [Post!]!
        comments: [Comment!]!
        post: Post!
    }

    type Mutation {
        createUser(data: CreateUserInput!): User!
        createPost(data: CreatePostInput!): Post!
        createComment(data: CreateCommentInput!): Comment!
    }

    input CreateUserInput {
        name: String!
        email: String!
        age: Int
    }

    input CreatePostInput {
        title: String!
        body: String!
        published: Boolean!
        author: ID!
    }

    input CreateCommentInput {
        text: String!
        author: ID!
        post: ID!
    }

    type User {
        id: ID!
        name: String!
        email: String! 
        age: Int
        posts: [Post!]!
        comments: [Comment]
    }

    type Post {
        id: ID!
        title: String!
        body: String!
        published: Boolean!
        author: User!
        comments: [Comment]
    }

    type Comment {
        commentId: ID!
        text: String!
        author: User!
        post: Post!
    }

`

// Resolvers 
const resolvers = {
    Query: {
        users(parent, args, ctx, info) {
            if (!args.query) {
                return users
            }
            return users.filter((user) => {
                return user.name.toLowerCase().includes(args.query.toLowerCase())
            })
        },
        posts(parent, args, ctx, info) {
            if (!args.query) {
                return posts
            } 
            return posts.filter((post) => {
                return post.title.toLowerCase().includes(args.query.toLowerCase())
            })
        }, 
        comments(parent, args, ctx, info) {
            return comments
        }
    },
    // Define the Mutation on the server 
    Mutation: {
        createUser(parent, args, ctx, info) {
            const emailTaken = users.some((user) => user.email === args.data.email)
            if (emailTaken) {
                throw new Error('Error: Email is already taken. ')
            }
            const user = {
                id: uuidv4(),
                ...args.data
            }
            users.push(user)
            return user
        },
        createPost(parent, args, ctx, info) {
            const userExists = users.some((user) => user.id === args.data.author)
            if (!userExists) {
                throw new Error('User not found')
            }
            const post = {
                id: uuidv4(), 
                ...args.data
            }
            posts.push(post)
            return post
        }, 
        createComment(parent, args, ctx, info) {
            const userExists = users.some((user) => user.id === args.data.author)
            if (!userExists) {
                throw new Error("User not found")
            }
            const postValidated = posts.some((post) => (post.id === args.data.post && post.published))
            if (!postValidated) {
                throw new Error('Post is not valid.')
            }
            const comment = {
                commentId: uuidv4(),
                ...args.data
            }
            comments.push(comment)
            return comment
        }
    },
    // For non-scalar field, we have to set up resolver function 
    // objects outside Query
    Post: {
        author(parent, args, ctx, info) {
            return users.find((user) => {
                return user.id === parent.author
            })
        },
        comments(parent, args, ctx, info) {
            return comments.filter((comment) => {
                return comment.post === parent.id
            })
        }
    },
    User: {
        posts(parent, args, ctx, info) {
            return posts.filter((post) => {
                return post.author === parent.id
            })
        },
        comments(parent, args, ctx, info) {
            return comments.filter((comment) => {
                return comment.author === parent.id
            })
        }
    },
    Comment: {
        author(parent, args, ctx, info) {
            return users.find((user) => {
                return user.id === parent.author
            })
        }, 
        post(parent, args, ctx, info) {
            return posts.find((post) => {
                return post.id === parent.post
            })
        }
    }
}

const server = new GraphQLServer({
    typeDefs: typeDefs,
    resolvers: resolvers
})

server.start(() => {
    console.log("The server is up!")
})
