const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const path = require('path');
const fileUpload = require('express-fileupload');

// const user_routes = require("./app/routes/user");
const gem_routes = require("./app/routes/gem.routes");
const user_routes = require("./app/routes/user.routes");

const app = express();
app.use('/public',express.static(__dirname + '/public'));

//Body parser middleware
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json());
app.use(cors());


// app.get("/public", (req, res) => res.send("Hello"));

//use routes
app.use("/api/gems", gem_routes);
app.use("/api/user", user_routes);

const port = process.env.PORT;

app.listen(port, () => console.log(`server is running on port ${port}`));   

//signup with google
//sign up
//login
//login with google
//admin login
//add user
