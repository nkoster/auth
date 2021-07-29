require('dotenv').config()

if (process.env.REFRESH_TOKEN_SECRET) {
  console.log('Private keys loaded.')
}

const API_PORT = process.env.API_PORT || 3011

const express = require('express')
const fs = require('fs')
// const cors = require('cors')
const app = express()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

let users = require('./db.json')

let refreshTokens = []

// app.use(cors())

app.use(express.json())

app.post('/logout', (req, res) => {
  console.log(`Logout ${req.body.username}`)
  refreshTokens = refreshTokens.filter(token => token !== req.body.token)
  res.redirect('/')
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
    fs.writeFile('./db.json', JSON.stringify(users), err => {
      if (err) throw err;
      console.log('User added.')
    })
    res.status(201).send()
  } catch(err) {
    console.log(err)
    res.status(500).send()
  }
})

const doLogin = async (req, res) => {
  const user = users.find(user => user.username === req.body.username)
  if (!user) {
    return res.status(400).send({ error: 'No such user' })
  }
  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      const accessToken = generateAccessToken(user)
      const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
      refreshTokens.push(refreshToken)
      req.body.token = refreshToken
      res.json({ accessToken, refreshToken })
    } else {
      res.status(200).send({ error: 'Not allowed' })
    }
  } catch(err) {
    console.log(err)
    res.status(500).send()
  }
}

app.post('/login', doLogin)
app.get('/login', doLogin)

function generateAccessToken(user) {
  console.log(`New token for ${user.username}`)
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '30m'
  })
}

app.listen(API_PORT, _ => console.log(`authServer running @ port ${API_PORT}`))
