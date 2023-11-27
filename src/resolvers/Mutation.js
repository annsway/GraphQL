import uuidv4 from "uuid";

/** Key Points for Mutation: 
* 1. Mutation: allows you to update/delete data on the server, e.g. sign up form
* 2. Client to define the mutation schema; server to define the mutation resolver 
*/
const Mutation = {
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
    updateUser(parent, args, {db}, info) {
        const {id, data} = args
        const user = db.users.find((user) => user.id === id)
        if (!user) {
            throw new Error('User not found')
        }
        if (typeof data.email === 'string') {
            const emailTaken = db.users.some((user) => user.email === data.email)
            if (emailTaken) {
                throw new Error('Email taken')
            }
            user.email = data.email
        }
        if (typeof data.name === 'string') {
            user.name = data.name
        }
        if (typeof data.age !== 'undefined') {
            user.age = data.age
        }
        return user
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
    updatePost(parent, {id, data}, {db}, info) {
        const post = db.posts.find((post) => post.id === id)
        if (!post) {
            throw new Error("Post not found")
        }
        if (typeof data.title === 'string') {
            post.title = data.title
        }
        if (typeof data.body === 'string') {
            post.body = data.body
        }
        if (typeof data.published === 'boolean') {
            post.published = data.published
        }
        return post
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
    },
    updateComment(parent, {commentId, data}, {db}, info) {
        const comment = db.comments.find((comment) => comment.commentId === commentId)
        if (!comment) {
            throw new Error("Comment not found")
        }
        if (typeof data.text === 'string') {
            comment.text = data.text
        }
        return comment
    }
}
export {Mutation as default}