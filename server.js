const express = require('express')
const app = express()
const bcrypt = require('bcrypt')

const users = []

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
    res.status(201).send()
  } catch(err) {
    console.log(err)
    res.status(500).send()
  }
})

app.post('/users/login', async (req, res) => {
  const user = users.find(user => user.username === req.body.username)
  if (!user) {
    return res.status(400).send('No such user')
  }
  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      res.send('Success')
    } else {
      res.send('Not allowed')
    }
  } catch(err) {
    console.log(err)
    res.status(500).send()
  }
})

app.listen(3010)
