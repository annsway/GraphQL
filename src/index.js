import { GraphQLServer } from "graphql-yoga";

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
    author: '1'
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
}, {
    commentId: '2',
    text: 'i do not believe it',
    author: '1'
}, {
    commentId: '3',
    text: 'you should be positive',
    author: '2'
}, {
    commentId: '4',
    text: 'trust yourself.',
    author: '2'
}]
// Type definition (schema)
const typeDefs = `
    type Query {
        users(query: String): [User!]!
        posts(query: String): [Post!]!
        comments: [Comment!]!
        post: Post!
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
    }

    type Comment {
        commentId: ID!
        text: String!
        author: User!
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
    // For non-scalar field, we have to set up resolver function 
    // objects outside Query
    Post: {
        author(parent, args, ctx, info) {
            return users.find((user) => {
                return user.id === parent.author
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
