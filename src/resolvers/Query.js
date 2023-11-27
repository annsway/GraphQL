/**
 * Key Points for Query: 
 * 1) There must be schema 
 * 2) You can query scalar types directly (String, Boolean, Int, Float, ID)
 * 3) For non-scalar types, you have to set up resolver function 
*/
const Query = {
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
}

export {Query as default}