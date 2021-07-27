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
    db.any("SELECT * FROM usertable")
        .then((usertabledata) => {
            res.render('pages/users', {
                users: usertabledata
            })
        })
        .catch((err) => {
            res.render("pages/error", {
                errorid: err.message
            })
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
        .catch((err) => {
            res.render("pages/error", {
                errorid: err.message
            })
        })
})

//Part 2
//for specific users
app.get('/users/:id', (req, res) => {
    const id = req.params.id
    const error = '404 Page cannot be displayed'

    db.any("SELECT * FROM usertable;")
        .then((usertabledata) => {
            if (id < usertabledata.length) {
                res.render('pages/usersid', {
                    usersid: usertabledata[id],
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
        .catch((err) => {
            res.render("pages/error", {
                errorid: err.message
            })
        })


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
                db.any("SELECT * FROM usertable;")
                    .then((datausers) => {
                        res.render('pages/schedulesnew', {
                            newUserData: datausers,
                            newSchedules: scheddata
                        })
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

    db.any("SELECT * FROM schedtable;")
        .then((scheddatatable) => {
            for (let i = 0; i < scheddatatable.length; i++) {
                if (userId == scheddatatable[i].user_id) {
                    newSched.push(scheddatatable[i])
                }
            }
        })
        .catch((err) => {
            res.render("pages/error", {
                errorid: err.message
            })
        })


    db.any("SELECT * FROM usertable;")
        .then((userdata) => {
            if (newSched.length == 0 || userId > userdata.length) {
                res.render('pages/error', {
                    errorid: error
                })
            } else {
                res.render('pages/useridsched', {
                    newSchedId: newSched
                })
            }

        })
        .catch((err) => {
            res.render("pages/error", {
                errorid: err.message
            })
        })



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

    db.none("INSERT INTO usertable (firstname, lastname, email, password) VALUES ($1, $2, $3, $4)", [req.body.firstName, req.body.lastName, req.body.emailAddress, hash])
        .then(() => {
            res.redirect('/users')
        })
        .catch((err) => {
            res.render("pages/error", {
                errorid: err.message
            })
        })
})

//Making sure that we are connected to a local host
app.listen(PORT, () => {
    console.log(`App is listening at http://localhost:${PORT}`)
})


