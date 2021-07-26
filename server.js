const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

require('dotenv').config()

const users = [
  {
    username: 'aap',
    password: '$2b$10$mMlIogWghogG8MaMRQhzGONRMrOTRUgzPcsDHAnpZ1WACp5tsIOIa'
  },
  {
    username: 'gijs',
    password: '$2b$10$dvOEdOx8q0WZ.HwEAwf5i.tfHCO/o4oTQn8Tq7zWm9tvRFdDeaxtq'
  }
]

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

app.get('/users', (req, res) => {
  res.send(users)
})

app.post('/users', async (req, res) => {
  try {
    const hashed = await bcrypt.hash(req.body.password, 10)
    const user = {
      username: req.body.username,
      password: hashed
    }
    users.push(user)
    console.log(hashed)
    res.status(201).send()
  } catch(err) {
    console.log(err)
    res.status(500).send()
  }
})

app.post('/login', async (req, res) => {
  const user = users.find(user => user.username === req.body.username)
  if (!user) {
    return res.status(400).send('No such user')
  }
  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
      res.json({ accessToken })
    } else {
      res.send('Not allowed')
    }
  } catch(err) {
    console.log(err)
    res.status(500).send()
  }
})

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