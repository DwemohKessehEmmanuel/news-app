const { render } = require('ejs');
const express = require('express');
const {pool} = require("./dbConfig");
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("express-flash");
const passport = require("passport");

const initializePassport = require("./passportConfig");

initializePassport(passport);

const app = express();

const PORT = process.env.PORT|| 4200;
app.set("view engine", "ejs")

app.use('/public',express.static('public'));
app.use(express.urlencoded({extended: false}))

app.use(session({
    secret: 'secret',

    resave: false,

    saveUninitialized: false
}));

app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

app.get('/', (req,res)=>{
    res.render("index");
})

app.get('/users/register',checkAuthenticated,(req,res)=>{
    res.render("register")
})
app.get('/users/login',checkAuthenticated,(req,res)=>{
    res.render("login")
})
app.get('/users/dashboard',checkNotAuthenticated,(req,res)=>{
    res.render("dashboard", {user: req.user.name})
});

app.get('/users/logout',(req,res,next)=>{
    req.logOut((err)=>{
        if(err){
            return next(err)
        }
         
         req.flash("success_msg", "You haved logged out");
         res.redirect("/users/login");
    });
    
   
})

app.post('/users/register', async (req,res)=>{
    let {name,email,password,password1} = req.body;

    console.log({name,email,password,password1})

    let errors = []

    if(!name||!email||!password||!password1){
        errors.push({message: "All fields must be entered"})
    }
    if(password !== password1){
        errors.push({message:"Passwords do not match"})
    }
    if(password.length < 6){
        errors.push({message: "Password must be at least 6 characters"})
    }
    if(errors.length > 0){
        res.render("register", {errors})
    }else{
        //form validation has passed
        let hashedPassword = await bcrypt.hash(password, 10)
        console.log(hashedPassword);

        pool.query(`SELECT * FROM auth WHERE
        email = $1`,[email], (err, results)=>{
            if(err){
                throw err
            }
            
            console.log(results.rows)

            if (results.rows.length > 0){
                errors.push({message:"User already exists"})
                res.render("register", {errors})
            }else{
                pool.query(`INSERT INTO auth(name,email,password)
                VALUES($1,$2,$3) RETURNING id,password`,[name,email,hashedPassword],(err,results)=>{
                    if(err){
                        throw err
                    }
                    console.log(results.rows);
                    req.flash("success_msg","You are now registered. Please log in");
                    res.redirect("/users/login")
                })
            }
            
        })
    }
})

app.post("/users/login", passport.authenticate('local',{
    successRedirect: "/users/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true
}))

function checkAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return res.redirect("/users/dashboard");
    }
    next()
}

function checkNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect("/users/login")
}

app.listen(PORT,()=>{
    console.log(`Server is listening at Port ${PORT}`);
})