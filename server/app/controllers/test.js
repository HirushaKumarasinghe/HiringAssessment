const colors = require('colors');
var cc = require('coupon-code');
const USER_MODEL = require("../db/models/tes");
const Buffer = require("Buffer");
//device detector
const DeviceDetector = require('node-device-detector');
const detector = new DeviceDetector;

const requestIP = require('request-ip');
const geoip = require('geoip-lite');
const multer = require('multer');
const validator = require('validator');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})

var upload = multer({ storage: storage })




const sgMail = require("@sendgrid/mail");

const nodemailer = require("nodemailer"),
  trancepoter = nodemailer.createTransport({
    host: "mail.smtp2go.com",
    port: 2525,
    secure: false, //true for 465 port, false for other ports
    auth: {
      user: "info@yunly.com",
      pass: "Yunly@712019"
    }
  }),
  EmailTemplate = require("email-templates").EmailTemplate,
  path = require("path"),
  Promice = require("bluebird");

const sendGridAPIKey = process.env.SENDGRID_API_KEY;

//postgres import
const pool = require("../../db/postgresql");

const test = async (req, res) => {
  try {
    var source = req.headers['user-agent']
    var clientIP = requestIP.getClientIp(req)
    var resultos = detector.parseOs(source)
    var resultclient = detector.parseClient(source)
    var resultdeviceType = detector.parseDeviceType(source, resultos, resultclient, {})
    var ipaddress = clientIP.split("ffff:").pop();
    var geo = geoip.lookup(ipaddress);

    // console.log("OS :" + resultos.name);
    // console.log("Browser : " + resultclient.name);
    // console.log("Device : " + resultdeviceType.type);
    // console.log("Country : " + geo.country);
    // console.log("Ip address : " + ipaddress);

    res.status(200).send({"Request found from :": ipaddress,"Geo Location ":geo.country});
  } catch (e) {
    console.log(e.message);
    res.status(500).send(`message:cannot provide this service at this time`);
  }
};


function checkEmail(mail) {
  return new Promise((resolve, reject) => {
    // if(validator.isEmail(mail)){
    pool.query(USER_MODEL.USERS_GET_email_by_email, [mail], function (err, results) {
      if (err) {
        console.log(
          "Error log while reading values from user table : " +
          err
        );
        resolve({ response: "500" });
        return false;
      } else {
        var resp = results.rows[0];
        if (typeof resp === "undefined" || resp === null) {
          console.log("Email is not in the db");
          resolve({ response: "true", email: mail });
          return true;
        } else {
          console.log("Email is in the db");
          resolve({ response: "false" });
          return false;
        }
      }
    });
    // }
    // else{
    //   resolve({ response: "false" });
    // }
  });
}

function loadTemplate(templateName, contexts) {
  let template = new EmailTemplate(
    path.join(__dirname, "templates", templateName)
  );
  return Promice.all(
    contexts.map(context => {
      return new Promice((resolve, reject) => {
        template.render(context, (err, result) => {
          if (err) reject(err);
          else
            resolve({
              email: result,
              context
            });
        });
      });
    })
  );
}

const signup = async (req, res) => {
  try {
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var useremail = req.body.useremail;
    var password = req.body.password;
    var cpassword = req.body.cpassword;
    var salt = req.body.salt;
    var accept_tos = req.body.accept_tos;
    var urival = req.body.uriv;

    var region = 'TW';
    var clientIP = requestIP.getClientIp(req)
    var ipaddress = clientIP.split("ffff:").pop();
    var geo = geoip.lookup(ipaddress);
    region = geo.country;



    // if(validator.isEmail(mail)){

    var checkemail = checkEmail(useremail);
    checkemail
      .then(function (value) {
        if (value.response == "true" && validator.isEmail(useremail)) {

          pool.query(
            USER_MODEL.USERS_POST_data,
            [firstname, lastname, "", useremail, "", ""],
            (error, results) => {
              if (error) {
                console.log("add user error!");
                res.status(500).send(`message:cannot provide this service at this time`);
              } else {
                pool.query(
                  USER_MODEL.USERS_GET_userid_by_email,
                  [useremail],
                  (error, results) => {
                    if (error) {
                      console.log("find user id error!");
                      res.status(500).send(`message:cannot provide this service at this time`);
                    } else {
                      const uidOfEmail = results.rows[0].userid;

                      console.log(password, salt);
                      pool.query(
                        USER_MODEL.USERLOGINS_POST_data,
                        [uidOfEmail, firstname, useremail, salt, password, region],
                        (error, results) => {
                          if (error) {
                            console.log(error);

                            res.status(500).json({ 'message': "cannot provide this service at this time" });
                          } else {
                            return res.status(201).json({ 'message': `new user created for ${useremail}` });
                          }
                        }
                      );
                    }
                  }
                );
              }
            }
          );
        } else {
          res.status(403).send(`Message:Already have an acccount`);
        }
      })
      .catch(err => console.log(err));
  } catch (e) {
    console.log(e.message);
    res.status(500).send(`message:cannot provide this service at this time`);
  }
};

const signupConfirmation = async (req, res) => {
  var useremail = req.body.useremail;
  var token = req.body.token;

  var checkemail = checkEmail(useremail);
  checkemail
    .then(function (value) {
      if (value.response == "false") {
        pool.query(
          constants.updateVerified,
          [useremail],
          (error, results) => {
            if (error) {
              res.status(404).send("Bad Request");
            } else {
              res.status(200).send("Success");
            }
          }
        );
      }
      else {
        res.status(404).send(`Message:User not found`);
      }
    });
};

const salt = async (req, res) => {
  var useremail = req.body.useremail;
  if (useremail === "") {
    res.status(400).json({ message: "Validation error" });
  } else {
    pool.query(USER_MODEL.USERLOGINS_GET_salt, [useremail], (error, results) => {
      if (error) {
        console.log(error);

        res.status(500).json({ message: "Cannot provide this service at this time" });
      } else {
        // console.log(results);
        if (results.rowCount > 0) {
          var resultsalt = results.rows[0].salt;
          //console.log("=================================================================" + resultsalt);
          res.status(200).send({ salt: resultsalt });
        } else {
          res.status(404).json({ message: "User not found" });
        }
      }
    });
  }
};

function loginValidation(logintype, email, password,) { };
function getUserName(email) {
  return new Promise((resolve, reject) => {
    pool.query(USER_MODEL.USERS_GET_username_by_email, [email], function (err, results) {
      if (err) {
        resolve({ response: "User" });
      }
      else {
        //console.log(results.rows)
        var resp = results.rows[0];
        // console.log(resp);
        console.log(resp.firstname);
        resolve({ response: resp.firstname });
      }
    });
  });
}
const login = async (req, res) => {

  var email = null;
  var password = null;
  var keepmesigin = null;
  var logintType = null;
  var userIdFacebook = "m__";
  var userIdLinkedId = null;
  var userIdGoogle = null;
  var operatingSystem = null;
  var clientBrowser = null;
  var clientDevice = null;
  var clientCountry = null;
  var clientIPAddress = null;

  var source = req.headers['user-agent']
  var clientIP = requestIP.getClientIp(req)

  var resultos = detector.parseOs(source)
  var resultclient = detector.parseClient(source)
  var resultdeviceType = detector.parseDeviceType(source, resultos, resultclient, {})
  // var results = Object.assign({ os: resultos.name }, { client: resultclient.name }, { device: resultdeviceType.type }, { ip: clientIP })

  // console.log(colors.blue(results));
  // console.log("fucking ip: " + clientIP);

  var ipaddress = clientIP.split("ffff:").pop();
  // console.log("after ip: " + ipaddress);

  var geo = geoip.lookup(ipaddress);



  operatingSystem = resultos.name;
  clientBrowser = resultclient.name;
  clientDevice = resultdeviceType.type;
  clientCountry = geo.country;
  clientIPAddress = ipaddress;

  console.log("OS :" + operatingSystem);
  console.log("Browser : " + clientBrowser);
  console.log("Device : " + clientDevice);
  console.log("Country : " + clientCountry);
  console.log("Ip address : " + clientIPAddress);

  //for manual login, gmail, linkedin
  email = req.body.useremail;
  password = req.body.password;

  //for manual login keep me sig in only for manual login
  keepmesigin = req.body.keepmesignin;

  //linkedId and google
  userIdLinkedId = req.body.lid;
  userIdGoogle = req.body.gid;

  logintType = req.body.lt;


  if (logintType == "m__") {
    console.log("In manual login process");
    if (
      (email != "null" || email != undefined) &&
      (password != "null" || password != undefined) &&
      (userIdFacebook == "m__") &&
      (userIdLinkedId == "m__") &&
      (userIdGoogle == "m__")
    ) {
      console.log("Null pointer validation success");

      var checkemail = checkEmail(email);
      checkemail.then(function (value) {
        if (value.response == "false") {
          var getusername = getUserName(email);
          getusername.then(function (valname) {
            pool.query(
              USER_MODEL.getPasswordsByUseremail,
              [email],
              (error, results) => {
                if (error) {
                  console.log("find user id error!");
                  res.status(404).send("Bad Request");
                } else {
                  if (password == results.rows[0].hash) {

                    var front_token = email;
                    var start_date = new Date();
                    var date_hour = start_date.getHours() + 2;
                    var sessio_timeout = "sessiontimeout" + date_hour;
                    var randomVal = Math.floor(10000 + Math.random() * 9000);

                    var code_start = front_token + sessio_timeout + randomVal;

                    var buf = Buffer.from(code_start, "ascii");
                    var buf1 = buf.toString("hex");
                    var buf2 = buf1.toString("base64");

                    console.log("In manual login process" + " " + buf2);
                    //===============================================================================================================
                    pool.query(
                      USER_MODEL.USERS_GET_userid_by_email,
                      [email],
                      (error, results) => {
                        if (error) {
                          console.log("find user id error!");
                          res.status(500).send(`message:cannot provide this service at this time`);
                        } else {
                          console.log("user id found");
                          const uidOfEmail = results.rows[0].userid;
                          pool.query(
                            USER_MODEL.LOGINSTATUS_ADD,
                            [uidOfEmail, clientIPAddress, clientBrowser, operatingSystem, clientDevice, buf2, 1, clientCountry],
                            (error, results) => {
                              console.log(error);
                              console.log(results);

                              if (error) {
                                res.status(500).json({ 'message': "cannot provide this service at this time" });
                              } else {
                                return res.status(200).json({
                                  email: email,
                                  token: buf2,
                                  username: valname.response
                                });
                              }
                            }
                          );
                        }
                      }
                    );
                  } else {
                    return res.status(400).json({ message: "Password Incorrect" });
                  }
                }
              }
            );
          });
        } else {
          res.status(401).send("No such useremail or password");
        }
      });
    } else {
      console.log("Null values for manual login");
      return res.status(400).json("eror");
    }
  } else if (logintType === "f") {
    if (
      (email == "null" || email == undefined) &&
      (password == "null" || password == undefined) &&
      (userIdFacebook != null || userIdFacebook != undefined) &&
      (userIdLinkedId == null || userIdLinkedId == undefined) &&
      (userIdGoogle == null || userIdGoogle == undefined)
    ) {
      console.log("In facebook login process" + " " + userIdLinkedId + email);
      var front_token = userIdFacebook;
      var start_date = new Date();
      var date_hour = start_date.getHours() + 2;
      var sessio_timeout = "sessiontimeout" + date_hour;
      var code_start = front_token + sessio_timeout;

      var buf = Buffer.from(code_start, "ascii");
      var buf1 = buf.toString("hex");
      var buf2 = buf1.toString("base64");

      console.log("In facebook login process" + " " + buf2);

      res.status(200).send({ email: "ubahukahan@yunly.com", token: buf2 });
    } else {
      res.status(401).send(`Unauthorized Access`);
    }
  } else if (logintType === "g") {
    if (
      (email != "null" || email != undefined) &&
      (password != "null" || password != undefined) &&
      (userIdFacebook == null || userIdFacebook == undefined) &&
      (userIdLinkedId == null || userIdLinkedId == undefined) &&
      (userIdGoogle != null || userIdGoogle != undefined)
    ) {
      console.log("In google login process" + " " + userIdLinkedId + email);
      var front_token = userIdGoogle;
      var start_date = new Date();
      var date_hour = start_date.getHours() + 2;
      var sessio_timeout = "sessiontimeout" + date_hour;
      var code_start = front_token + sessio_timeout;

      var buf = Buffer.from(code_start, "ascii");
      var buf1 = buf.toString("hex");
      var buf2 = buf1.toString("base64");

      console.log("In google login process" + " " + buf2);

      res.status(200).send({ email: "ubahukahan@yunly.com", token: buf2 });
    } else {
      res.status(401).send(`Unauthorized Access`);
    }
  } else if (logintType === "l") {
    if (
      (email == "null" || email == undefined) &&
      (password == "null" || password == undefined) &&
      (userIdFacebook == null || userIdFacebook == undefined) &&
      (userIdLinkedId != null || userIdLinkedId != undefined) &&
      (userIdGoogle == null || userIdGoogle == undefined)
    ) {
      console.log("In linkedin login process" + " " + userIdLinkedId + email);
      var front_token = userIdLinkedId;
      var start_date = new Date();
      var date_hour = start_date.getHours() + 2;
      var sessio_timeout = "sessiontimeout" + date_hour;
      var code_start = front_token + sessio_timeout;

      var buf = Buffer.from(code_start, "ascii");
      var buf1 = buf.toString("hex");
      var buf2 = buf1.toString("base64");

      console.log("In linkedin login process" + " " + buf2);

      res.status(200).send({ email: "ubahukahan@yunly.com", token: buf2 });
    } else {
      res.status(401).send(`Unauthorized Access`);
    }
  } else if (logintType === null) {
    res.status(401).send(`Unauthorized Access`);
  } else {
    res.status(401).send(`Unauthorized Access`);
  }
};
const logout = async (req, res) => { };


function sendEmail(obj) {
  return trancepoter.sendMail(obj);
}

const frogotPassword = async (req, res) => {
  var useremail = req.body.useremail;
  var urival = req.body.uriv;

  const checkemail = checkEmail(useremail);

  checkemail.then(function (value) {
    if (value.response == "true") {
      return res.status(404).json({ message: "User not found" });
    } else {
      var start_date = new Date();
      var date_hour = start_date.getHours() + 2;
      var sessio_timeout = "sessiontimeout" + date_hour;
      var code_start = useremail + sessio_timeout;

      var buf = Buffer.from(code_start, "ascii");
      var buf1 = buf.toString("hex");
      var buf2 = buf1.toString("base64");

      var getusername = getUserName(useremail);
      getusername.then(function (valname) {

        var all = buf2 + "|" + useremail;
        var allencoded = all.toString("base64");
        var rederectlink =
          "http://" + urival + allencoded;
        // var rederectlink = "http://" + urival + buf2 + "|" + useremail;
        console.log(rederectlink);

        sgMail.setApiKey(sendGridAPIKey);
        var msg = {
          to: useremail,
          from: 'support@industryseeker.com',
          template_id: 'd-0750b018fe004198a866b5e4ccf81abc',
          dynamic_template_data: {
            username: valname.response,
            link: rederectlink
          }
        };
        const sendMessagePromise = sgMail.send(msg);

        return Promise.all([sendMessagePromise]).then(() => {
          return res.status(200).json("Success");
        }).catch((err) => {
          return console.log(err);
        });

      });
    }
  });
};
const frogotPasswordConfirmation = async (req, res) => {
  var cpassword = req.body.cpassword;
  var password = req.body.password;
  var useremail = req.body.useremail;
  var token = req.body.token;

  if (cpassword == password) {
    pool.query(
      USER_MODEL.updatepass,
      [password, useremail],
      (error, results) => {
        if (error) {
          res.status(404).json({ message: "User not found" });
        } else {
          res.status(200).send("Success");
        }
      }
    );
  } else {
    res.status(400).json({ message: "Validation Error" });
  }
};
const showUserData = async (req, res) => {
  console.log("here=================");

  var token = req.body.token;
  var useremail = req.body.useremail;

  console.log("User Email : " + useremail);


  if (token != null || token != "" || token != undefined) {
    pool.query(
      USER_MODEL.USERS_GET_data,
      [useremail],
      (error, userresults) => {
        if (error) {
          res.status(404).json({ message: "User not found" });
        } else {
          if (userresults.rowCount > 0) {
            pool.query(
              USER_MODEL.LOGINSTATUS_GET,
              [userresults.rows[0].userid],
              (error, loginresults) => {
                if (error) {
                  res.status(404).json({ message: "User not found" });
                } else {
                  pool.query(
                    USER_MODEL.LOGINSTATUS_CurrentID,
                    [token],
                    (error, logindevice) => {
                      if (error) {
                        res.status(404).json({ message: "User not found" });
                      } else {
                        pool.query(
                          USER_MODEL.BILLING_DATA_GET,
                          [token],
                          (error, billings) => {
                            if (error) {
                              res.status(404).json({ message: "User not found" });
                            } else {
                              if (userresults.rowCount == 1 && logindevice.rowCount == 1 && loginresults.rowCount > 0 && billings.rowCount >= 0) {
                                res.status(200).json({ User: userresults.rows[0], LoginDetails: loginresults.rows, CurrentDeviceID: logindevice.rows[0].login_id, InvoiceList: billings.rows });
                              }
                              else {
                                res.status(400).json({ Message: "Validation error" });
                              }
                            }
                          }
                        );
                      }
                    }
                  );
                }
              }
            );
          }
          else {
            res.status(404).json({ message: "User not found" });
          }
        }
      }
    );
  } else {
    res.status(400).json({ message: "Validation Error" });
  }
};
const updateUserNames = async (req, res) => {
  var token = req.body.token;
  var useremail = req.body.useremail;
  var firstname = req.body.firstname;
  var lastname = req.body.lastname;

  if (token != null) {
    pool.query(
      USER_MODEL.USERS_PUT_names,
      [firstname, lastname, useremail],
      (error, results) => {
        if (error) {
          res.status(404).json({ message: "User not found" });
        } else {
          res.status(200).json({ Message: "Success", Usename: firstname });
        }
      }
    );
  } else {
    res.status(400).json({ message: "Validation Error" });
  }
};

const updateEmail = async (req, res) => {
  var token = req.body.token;
  var useremail = req.body.useremail;
  var newemail = req.body.newemail;

  var val = Math.floor(1000 + Math.random() * 9000);
  console.log(val);


  var getusername = getUserName(useremail);
  getusername.then(function (valname) {
  if(useremail != newemail){
    pool.query(
      USER_MODEL.USERS_GET_userid_by_email,
      [useremail],
      (error, results) => {
        if (error) {
          res.status(404).json({ message: "User not found" });
        } else {
          const uidOfEmail = results.rows[0].userid;
          pool.query(
            USER_MODEL.USER_CONFIRMATIONS_ADD,
            [uidOfEmail, "REmail", val, newemail],
            (error, results) => {
              if (error) {
                console.log(error);

                res.status(404).json({ message: "User not found" });
              } else {
                // loadTemplate("resetcode", users)
                //   .then(results => {
                //     return Promice.all(
                //       results.map(result => {
                //         sendEmail({
                //           to: newemail,
                //           from:
                //             "'User Email Verification IndustrySeeker.com ✔' <info@yunly.com>",
                //           subject: result.email.subject,
                //           html: result.email.html,
                //           text: result.email.text
                //         });
                //       })
                //     );
                //   })
                //   .catch(err => {
                //     console.log(err);
                //   })
                //   .then(() => {
                //     return res.status(200).json({ Message: 'Please enter 4 digit code' });
                //   });


                sgMail.setApiKey(sendGridAPIKey);
                var msg = {
                  to: newemail,
                  from: 'support@industryseeker.com',
                  template_id: 'd-51f641fca22440728cd9f649c357c9c9',
                  dynamic_template_data: {
                    username: valname.response,
                    resetlink: val
                  }
                };
                const sendMessagePromise = sgMail.send(msg);

                return Promise.all([sendMessagePromise]).then(() => {
                    return res.status(200).json({ Message: 'Please enter 4 digit code' });
              }).catch((err) => {
                return res.status(500);
              });

              }
            }
          );
        }
      }
    );}else{
      res.status(400).json({ message: "Same email" });
    }
  });
};

const verifyUpdatedEmail = async (req, res) => {
  var token = req.body.token;
  var code = req.body.code;

  console.log(code);


  if (token != null && code != null) {
    pool.query(
      USER_MODEL.RESET_EMAIL_CONFIRM,
      [code],
      (error, resultsconfirmations) => {
        if (error) {
          console.log(error);
          res.status(400).json({ message: "Validation error" });
        } else {
          console.log(resultsconfirmations);
          if (resultsconfirmations.rowCount == 1) {
            const resultUserID = resultsconfirmations.rows[0].userid;
            const resultType = resultsconfirmations.rows[0].type;
            const resultEmail = resultsconfirmations.rows[0].forvalue;
            console.log("Changing user id :" + resultUserID);
            console.log("Changing user email :" + resultEmail);

            pool.query(
              USER_MODEL.RESET_EMAIL_UPDATE_USERS,
              [resultEmail, resultUserID],
              (error, results) => {
                if (error) {
                  console.log(error);

                  res.status(500).json({ message: "cannot provide this service at this time" });
                } else {
                  console.log(results);

                  pool.query(
                    USER_MODEL.RESET_EMAIL_UPDATE_USERLOGIN,
                    [resultEmail, resultUserID],
                    (error, results) => {
                      if (error) {
                        console.log(error);
                        res.status(500).json({ message: "cannot provide this service at this time" });
                      } else {
                        if (results.rowCount == 1) {
                          res.status(200).json({ Message: "Success" });
                        } else {
                          res.status(400).json({ message: "Validation error" });
                        }
                      }
                    }
                  );
                }
              }
            );
          } else {
            res.status(400).json({ message: "Validation error" });
          }

        }
      }
    );
  } else {
    res.status(400).json({ message: "Validation Error" });
  }
};

const signout = async (req, res) => {
  var token = req.body.token;
  pool.query(
    USER_MODEL.SIGNOUT_ME,
    [token],
    (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).json({ message: "cannot provide this service at this time" });
      } else {
        res.status(200).json({ Message: "Success" });
      }
    }
  );
};
const signoutMobile = async (req, res) => {
  var token = req.body.token;
  var login_id = req.body.login_id;

  console.log(login_id);


  pool.query(
    USER_MODEL.SIGNOUT_IT_for_ME,
    [login_id],
    (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).json({ message: "cannot provide this service at this time" });
      } else {
        console.log(results);

        res.status(200).json({ Message: "Success" });
      }
    }
  );
};
const signOutAll = async (req, res) => {
  var token = req.body.token;
  var login_id = req.body.login_id;
  pool.query(
    USER_MODEL.SIGNOUT_All,
    [token],
    (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).json({ message: "cannot provide this service at this time" });
      } else {
        res.status(200).json({ Message: "Success" });
      }
    }
  );
};

const updateProfilePic = async (req, res) => {
  var token = req.body.token;
  // var profilepic = req.file.profilepic;

  console.log("token" + token);

  if (!req.files)
    return res.status(400).send('No files were uploaded.');

  var file = req.files.profilepic;
  var img_name = file.name;

  console.log(file);


  if ((file.mimetype == "image/jpeg" || file.mimetype == "image/png") && img_name == "blob") {

    file.name = cc.generate();
    console.log(file);

    file.mv('public/images/upload_images/' + file.name, function (err) {

      if (err) {
        console.log(err);

        return res.status(500);
      }

      else {

        var final_img_name = "http://95.111.237.27:9000/images/upload_images/" + file.name;
        pool.query(
          USER_MODEL.UPDATE_PROFILE_pic,
          [final_img_name, token],
          (error, results) => {
            if (error) {
              console.log(error);
              res.status(500).json({ message: "cannot provide this service at this time" });
            } else {
              res.status(200).json({ Message: "Success" });
            }
          }
        );
      }
    });
  } else {
    message = "This format is not allowed , please upload file with '.png','.jpg'";
    //  res.render('index.ejs',{message: message});
    res.status(400).json({ Message: "formate error" });

  }
};
const deleteUser = async (req, res) => {
  var token = req.body.token;
  var password = req.body.password;
  console.log(token + " fuck " + password);

  pool.query(
    USER_MODEL.DELETE_USER,
    [token, password],
    (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).json({ message: "cannot provide this service at this time" });
      } else {
        console.log("On deleteing ================================== ");
        console.log(results);
        if (results.rowCount == 1) {
          res.status(200).json({ Message: "Success" });
        }
        else {
          res.status(400).json({ Message: "Validation error" });
        }
      }
    }
  );
};



const updatePassword = async (req, res) => {
  var token = req.body.token;
  var password = req.body.password;
  var newpassword = req.body.newpassword;

  // console.log(token + " tik " + password + " tok " + newpassword);

  pool.query(
    USER_MODEL.UPDATE_password,
    [newpassword, token, password],
    (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).json({ message: "cannot provide this service at this time" });
      } else {
        if (results.rowCount == 1) {
          res.status(200).json({ Message: "Success" });
        } else {
          res.status(400).json({ message: "Validation error" });
        }
      }
    }
  );
};

const updateBillingAddress = async (req, res) => {
  var token = req.body.token;
  var address = req.body.billingaddress;
  var state = req.body.billingstate;
  var country = req.body.billingcountry;
  var postalcode = req.body.billingpostalcode;
  var city = req.body.billingcity;
  var contact = req.body.contact;
  var email_invoicing = req.body.emailinvoicing;
  var business_email = req.body.businessemail;

  console.log(token + " token " + address + " address " + state + " state " + country + " country " + postalcode + " postlacode " + city + " city " + contact + " conta " + email_invoicing + " email " + business_email);

  pool.query(
    USER_MODEL.BILLING_ADDRESS_UPDATE,
    [address, state, country, postalcode, city, contact, email_invoicing, business_email, token],
    (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).json({ message: "cannot provide this service at this time" });
      } else {
        if (results.rowCount == 1) {
          res.status(200).json({ Message: "Success" });
        } else {
          res.status(400).json({ message: "Validation error" });
        }
      }
    }
  );
};

const updateCompanyName = async (req, res) => {
  var token = req.body.token;
  var companyname = req.body.companyname;

  console.log(token + " tok " + companyname + " compa ");

  pool.query(
    USER_MODEL.COMPANY_UPDATE,
    [companyname, token],
    (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).json({ message: "cannot provide this service at this time" });
      } else {
        if (results.rowCount == 1) {
          res.status(200).json({ Message: "Success" });
        } else {
          res.status(400).json({ message: "Validation error" });
        }
      }
    }
  );
};

const followCompany = async (req, res) => {
  var token = req.body.token;
  var companyid = req.body.companyid;

  console.log(token + " tok " + companyid + " compa add to user ");

  pool.query(
    USER_MODEL.APPEND_USER_INTEREST,
    [companyid, token],
    (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).json({ message: "cannot provide this service at this time" });
      } else {
        if (results.rowCount == 1) {
          res.status(200).json({ Message: "Success" });
        } else {
          res.status(400).json({ message: "Validation error" });
        }
      }
    }
  );
};
const unFollowCompany = async (req, res) => {
  var token = req.body.token;
  var companyid = req.body.companyid;

  console.log(token + " tok " + companyid + " compa ");

  pool.query(
    USER_MODEL.REMOVE_USER_INTEREST,
    [companyid, token],
    (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).json({ message: "cannot provide this service at this time" });
      } else {
        if (results.rowCount == 1) {
          res.status(200).json({ Message: "Success" });
        } else {
          res.status(400).json({ message: "Validation error" });
        }
      }
    }
  );
};

const basicPackages = async (req, res) => {
  var token = req.body.token;

  console.log(token + "in basic package");

  pool.query(
    USER_MODEL.BASIC_PACKAGES,
    [],
    (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).json({ message: "cannot provide this service at this time" });
      } else {
        if (results.rowCount > 0) {
          res.status(200).json({ Data: results.rows });
        } else {
          res.status(400).json({ message: "Validation error" });
        }
      }
    }
  );
};

const subPackages = async (req, res) => {
  var token = req.body.token;
  var basic = req.body.basic;

  console.log(token + "in sub package " + basic);

  pool.query(
    USER_MODEL.SUB_PACKAGES,
    [basic],
    (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).json({ message: "cannot provide this service at this time" });
      } else {
        if (results.rowCount > 0) {
          res.status(200).json({ Data: results.rows });
        } else {
          res.status(400).json({ message: "Validation error" });
        }
      }
    }
  );
};
const userPackage = async (req, res) => {
  var token = req.body.token;

  console.log(token + " in user package");

  pool.query(
    USER_MODEL.GET_USER_PACKAGE,
    [token],
    (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).json({ message: "cannot provide this service at this time" });
      } else {
        if (results.rowCount > 0) {
          res.status(200).json({ Data: results.rows });
        } else {
          res.status(400).json({ message: "Validation error" });
        }
      }
    }
  );
};

const showUsage = async (req, res) => {
  var token = req.body.token;

  console.log(token + " in usage ");

  pool.query(
    USER_MODEL.USAGE_STAT,
    [token],
    (error, results_stat) => {
      console.log(results_stat.rows);

      if (error) {
        console.log(error);
        res.status(500).json({ message: "cannot provide this service at this time" });
      } else {
        if (true) {
          // results_stat.rowCount > 0
          pool.query(
            USER_MODEL.USAGE_by_DATES,
            [token],
            (error, results_by_dates) => {
              console.log(results_by_dates.rows);

              if (error) {
                console.log(error);
                res.status(500).json({ message: "cannot provide this service at this time" });
              } else {

                if (results_by_dates.rowCount >= 0) {
                  res.status(200).json({ Stats: results_stat.rows, Usage_History: results_by_dates.rows });
                } else {
                  // res.status(200).json({ message: "Validation error" });
                  res.status(200).json({ Stats: [], Usage_History: [] });
                }
              }
            }
          );
        } else {
          res.status(400).json({ message: "Validation error" });
        }
      }
    }
  );
};


const showUsageSummary = async (req, res) => {
  var token = req.body.token;

  pool.query(
    USER_MODEL.USAGE_CHECK,
    [token],
    (error, results) => {
      if (error) {
        res.status(500);
      } else {
        // console.log(results.rows[0].package_size);

        res.status(200).json({ total: results.rows[0].package_size, remaining: results.rows[0].total_remaining });
      }
    }
  );
};

const generateCoupon = async (req, res) => {
  var token = req.body.token;

  console.log(cc.generate());

};

const validateCoupon = async (req, res) => {
  var token = req.body.token;
  var coupon = req.body.coupon;

  console.log(token + " in promotions process " + coupon);


  pool.query(
    USER_MODEL.GET_USER_COUPON_DISCOUNT,
    [token, coupon],
    (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).json({ message: "cannot provide this service at this time" });
      } else {
        if (results.rowCount > 0) {
          console.log(results.rows[0].discount);

          var coupon_discount = results.rows[0].discount;

          res.status(200).json({ amount: "40.12", discount: coupon_discount });
        } else {
          res.status(400).json({ message: "Validation error" });
        }
      }
    }
  );
};
const userVerify = async (req, res) => {

  if (req.body.token == "" || req.body.token == undefined || req.body.token == null)
    return res.status(400).json({ message: "Validation error" });

  var token = req.body.token;
  //console.log(token + " in user verification process ");
  pool.query(
    USER_MODEL.VERIFY_USER,
    [token],
    (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).json({ message: "cannot provide this service at this time" });
      } else {
        // console.log(results.rowCount);

        if (results.rowCount == 1) {

          res.status(200).json({ data: "valied" });
        } else {
          res.status(404).json({ message: "User not found" });
        }
      }
    }
  );
};


module.exports = {
//   test,
  signup,
  signupConfirmation,
  salt,
  login,
  frogotPassword,
  frogotPasswordConfirmation,
  showUserData,
  updateUserNames,
  updateEmail,
  verifyUpdatedEmail,
  signout,
  signoutMobile,
  signOutAll,
  updateProfilePic,
  deleteUser,
  updatePassword,
  updateBillingAddress,
  updateCompanyName,
  followCompany,
  unFollowCompany,
  basicPackages,
  userPackage,
  showUsage,
  showUsageSummary,
  userVerify,
  subPackages,
  generateCoupon,
  validateCoupon
}

