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

app.listen(3011)
