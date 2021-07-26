const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')

require('dotenv').config()

const posts = [
  {
    username: 'aap',
    title: 'Post 1'
  },
  {
    username: 'gijs',
    title: 'Post 2'
  }
]

app.use(express.json())

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) {
    return res.status(401).send()
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).send()
    }
    req.user = user
    next()
  })
}

app.post('/posts', authenticateToken, (req, res) => {
  console.log(req.user)
  res.json(posts.filter(post => post.username === req.user.username))
})

console.log(process.env.ACCESS_TOKEN_SECRET)
app.listen(3010)