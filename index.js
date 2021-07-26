const express = require('express')
const data = require('./data')
const bcrypt = require('bcryptjs')
const ejs = require('ejs')
const db = require('./database')

const app = express()

//Body parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//EJS config
app.set('view engine', 'ejs')
app.set('views', './views')

//set 'public' folder as static folder
app.use(express.static('./public'))


//Port specified
const PORT = 3000

//ROUTES
//Part 1
app.get('/', (req, res) => {
    res.render('pages/home')
})

//all users
app.get('/users', (req, res) => {
    res.render('pages/users', {
        users: data.users
    })
})

//all schedules
app.get('/schedules', (req, res) => {

    db.any("SELECT * FROM schedtable;")
        .then((schedtabledata) => {
            res.render('pages/schedules', {
                schedules: schedtabledata
            })
        })
        .catch((test1) => {
            console.log(error)
            res.send(error.message)
        })
})

//Part 2
//for specific users
app.get('/users/:id', (req, res) => {
    const id = req.params.id
    const error = '404 Page cannot be displayed'
    if (id < data.users.length) {
        res.render('pages/usersid', {
            usersid: data.users[id],
        })
    }
    else if (id == 'new') {
        res.render('pages/usersnew')
    } else {
        res.render('pages/error', {
            errorid: error
        })
    }

})

//for specific schedules
app.get('/schedules/:id', (req, res) => {
    const id = req.params.id
    const error = '404 Page cannot be displayed'

    db.any("SELECT * FROM schedtable;")
        .then((scheddata) => {
            if (id < scheddata.length) {
                res.render('pages/schedulesid', {
                    schedulesid: scheddata[id],
                })
            }
            else if (id == 'new') {
                res.render('pages/schedulesnew', {
                    newUserData: data.users,
                    newSchedules: scheddata
                })
            } else {
                res.render('pages/error', {
                    errorid: error
                })
            }
        })
        .catch((err) => {
            res.render("pages/error", {
                errorid: err.message
            })
        })
})


//for specific schedules for each users

app.get('/users/:id/schedules', (req, res) => {
    const newSched = []
    const userId = req.params.id
    const error = '404 Page cannot be displayed'
    for (let i = 0; i < data.schedules.length; i++) {
        if (userId == data.schedules[i].user_id) {
            newSched.push(data.schedules[i])
        }
    }
    if (newSched.length == 0 || userId > data.users.length) {
        res.render('pages/error', {
            errorid: error
        })
    } else {
        res.render('pages/useridsched', {
            newSchedId: newSched
        })
    }
})

//Add new schedule
app.post('/schedules', (req, res) => {
    const newSched = req.body

    db.none("INSERT INTO schedtable(user_id, day, start_at, end_at) VALUES ($1, $2, $3, $4);", [newSched.user_id, newSched.day, newSched.start_at, newSched.end_at])
        .then(() => {
            res.redirect('/schedules')
        })
        .catch((err) => {
            res.render("pages/error", {
                errorid: err.message
            }
            )
        })
})


//Add new user
app.post('/users', (req, res) => {
    const password = req.body.password
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync(password, salt)

    const newUser = {
        firstname: req.body.firstName,
        lastname: req.body.lastName,
        email: req.body.emailAddress,
        password: hash
    }

    data.users.push(newUser)
    res.render('pages/users', {
        users: data.users
    })

})

//Making sure that we are connected to a local host
app.listen(PORT, () => {
    console.log(`App is listening at http://localhost:${PORT}`)
})


