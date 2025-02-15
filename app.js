const express = require('express');
const path = require('path');
const app = express();
const fs=require("fs");

app.use(express.static(path.join(__dirname, 'public')));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const userSchema = require("./models/users");
const cookieParser = require("cookie-parser");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
app.use(cookieParser());

app.get("/", (req, res) => {
    res.render('login');
})

app.get("/register", (req, res) => {
    res.render("register");
})

app.post("/register", async (req, res) => {
    let { username, email, password } = req.body;

    bcrypt.genSalt(10,async (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            let user = await userSchema.create({
                username,
                email,
                password: hash,
            })

            let token = jwt.sign({ email }, "secret");
            res.cookie("token", token);

            const data =await require('./info.json');
            res.render("index",{data:data});
        })
    })
});

app.post("/login", async (req, res) => {
    let { email, password } = req.body;

    let user = await userSchema.findOne({ email });

    if (!user) res.status(500).send("Something is Wrong");

    else {
        bcrypt.compare(password, user.password,async (err, result) => {
            if (result) {
                let token = jwt.sign({ email: email, userid: user._id }, "secret");
                res.cookie("token", token);
                
                const data =await require('./info.json');
                res.render("index",{data:data});
            }
            else {
                res.send("Something is wrongggg");
            }
        });
    }
});


app.get('/logout', (req, res) => {
    res.cookie("token", "");
    res.redirect("/");
})


app.get('/audio',isLoggedin, (req, res) => {
    // Read the JSON file
    fs.readFile(path.join(__dirname, 'audios.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading audio links');
        }

        // Parse the JSON data
        const audioData = JSON.parse(data);
        res.render('audioTherapy', { audioLinks: audioData.audioLinks ,prodacast :audioData.prodcast,audiobooks:audioData.audiobooks});
    });
});

app.get("/readingTherapy",isLoggedin,async (req,res)=>{
    const data =await require('./read.json');
    res.render("readingTherapy",{data});
});

app.get("/yogaTherapy",isLoggedin,async (req,res)=>{
    const data =await require('./yoga.json');
    res.render("yogaTherapy",{yogaData:data});
});

app.get("/laughTherapy",isLoggedin,async (req,res)=>{
    const data =await require('./laugh.json');
    res.render("laughTherapy",{data:data});
});

app.get("/talkingTherapy",isLoggedin,async (req,res)=>{
    const data =await require('./talking.json');
    res.render("talkingTherapy",{data:data});
});

app.get("/childTherapy",isLoggedin,async (req,res)=>{
    const data =await require('./child.json');
    res.render("childTherapy",{data:data});
});

app.get("/spirituality",isLoggedin,(req,res)=>{
    res.render("spirituality");
});

app.get("/sports",isLoggedin,async (req,res)=>{
    const data =await require('./sports.json');
    res.render("sports",{data:data});
});


function isLoggedin(req, res, next) {
    if (req.cookies.token === "") {
        res.redirect("/login");
    }
    else {
        let data = jwt.verify(req.cookies.token, "secret");
        req.user = data;
        next();
    }
}

app.listen(3000);