const express = require('express')
const cors = require('cors')
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

let refreshTokens = []

app.use(cors())

app.use(express.json())

app.delete('/logout', (req, res) => {
  refreshTokens = refreshTokens.filter(token => token !== req.body.token)
  res.status(204).send()
})

app.post('/token', (req, res) => {
  const refreshToken = req.body.token
  if (!refreshToken) {
    return res.status(401).send()
  }
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).send()
  }
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).send()
    }
    const accessToken = generateAccessToken({ username: user.username })
    res.json({ accessToken })
  })
})

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
      const accessToken = generateAccessToken(user)
      const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
      refreshTokens.push(refreshToken)
      req.body.token = refreshToken
      res.json({ accessToken, refreshToken })
    } else {
      res.send('Not allowed')
    }
  } catch(err) {
    console.log(err)
    res.status(500).send()
  }
})

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '30s'
  })
}

app.listen(3011)
