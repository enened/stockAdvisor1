const axios = require("axios")
const express = require("express");
const app = express();
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require("express-session");
const bcrypt = require("bcrypt")
const saltRounds = 10

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'stock_advisor'
});
  
app.listen(3001, () => { console.log(`Server started on port 3001`) });
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.text());
app.use(express.json())
app.use(cors({ origin: ["http://localhost:3000"], methods: ["GET", "POST"], credentials: true }))
app.use(session({ key: "userLogin", secret: "hsbdb131dkhsa3fik3egfiew4g232ifewbf4wehfuwef", resave: false, saveUninitialized: false, cookie: { expires: (60 * 60 * 24 * 60)}}))

app.get("/session", (req, res)=>{
    if(req.session.user){
        res.send(req.session.user)
    }
    else{
        res.send({})
    }
})

app.post("/login", (req, res)=>{

    const password = req.body.password
    const username = req.body.username

    db.query("select * from login where username = ?", [username], (err, result)=>{
        if (err){
            console.log(err)
        }
        else{
            if(result.length > 0){
                bcrypt.compare(password, result[0].password, (err, response)=>{
                    if (err){
                        console.log(err)
                    }
                    else if (response){
                      req.session.user = result;
                      res.send(result)
                    }
                    else{
                      res.send("Wrong combo")
                    }
                })
            }
            else{
                res.send("Wrong combo")
            }
        }
    })
})

app.post("/signUp", (req, res)=>{
    const password = req.body.password
    const username = req.body.username

    db.query("select userId from login where username = ?", [username], (err, result)=>{
        if(err){
            console.log(err)
        }
        else{
            if(result.length > 0){
                res.send("username in use")
            }
            else{
                bcrypt.hash(password, saltRounds, (err, hash)=>{
                    db.query("insert into login(username, password) values(?, ?)", [username, hash], (err, result)=>{

                        if (err){
                            console.log(err)
                        }
                        else{
                            req.session.user = [{username: username, userID: result.insertId}];
                            res.send([result.insertId])
                        }
                    })
                  })
            }
        }
    })
})

app.post("/logout", (req, res)=>{
    req.session.user = null
    res.send("ok")
})

app.post("/getStocksTracking", (req, res)=>{
    const userId = req.body.userId
    db.query("select stockCode from stocks_tracking where userId = ?", [userId], (err, result)=>{
        if(err){
            console.log(err)
        }
        else{
            res.send(result)
        }
    })
})

app.post("/trackStock", (req, res)=>{
    const userId = req.body.userId
    const stockCode = req.body.stockCode
    db.query("insert into stocks_tracking(userId, stockCode) values(?, ?)", [userId, stockCode], (err, result)=>{
        if(err){
            console.log(err)
        }
        else{
            res.send("ok")
        }
    })
})

app.post("/stopTracking", (req, res)=>{
    const userId = req.body.userId
    const stockCode = req.body.stockCode
    db.query("delete from stocks_tracking where userId = ? and stockCode = ?", [userId, stockCode], (err, result)=>{
        if(err){
            console.log(err)
        }
        else{
            res.send("ok")
        }
    })
})