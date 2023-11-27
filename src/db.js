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

const db = {
    users,
    posts, 
    comments
}

export {db as default}