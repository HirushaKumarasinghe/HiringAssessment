const { body, validationResult } = require("express-validator");
const DeviceDetector = require("node-device-detector");
const detector = new DeviceDetector();
const requestIP = require("request-ip");
const geoip = require("geoip-country");
const CryptoJS = require("crypto-js");
const randomToken = require("random-token");
const bcrypt = require("bcryptjs");
const mailjet = require("node-mailjet").connect(
  "aa00aad44600ebeb18345bda887dcd4c",
  "5ac083e8e65b7e86e28c38371823ec20"
);

const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.CLIENT_ID);

//postgres import
const pool = require("../db/postgresql");
const USER_MODEL = require("../db/models/user.queries");

// const encryptWithAES = (text) => {
//   const passphrase = "123";
//   return CryptoJS.AES.encrypt(text, passphrase).toString();
// };

// const decryptWithAES = (ciphertext) => {
//   const passphrase = "123";
//   const bytes = CryptoJS.AES.decrypt(ciphertext, passphrase);
//   const originalText = bytes.toString(CryptoJS.enc.Utf8);
//   return originalText;
// };
// lewdsstars
const testcrypto = async (req, res) => {
  let randy = Math.random().toString(20).substring(7, 20);
  console.log(randy);
  let encrypted = CryptoJS.AES.encrypt(
    randy,
    "lewdsstarsalfaechoxvids123"
  ).toString();

  return res.send({ stc: encrypted });
};

const twotestcrypto = async (req, res) => {
  let ctok = req.body.ctok;
  let bytes = CryptoJS.AES.decrypt(ctok, "lewdsstarsalfaechoxvids123");
  let originalText = bytes.toString(CryptoJS.enc.Utf8);
  let vnext = originalText + "y2BoK1XrUHxvdinethrugood255";
  vnext = CryptoJS.AES.encrypt(vnext, "lewdsstarsalfaechoxvids123").toString();

  return res.send({ ctok: vnext, session: ctok });
};
const twofuckcrypto = async (req, res) => {
  const saltB = bcrypt.genSaltSync(10);
  const hashB = bcrypt.hashSync(
    "erdt4ever143@H",
    "$2a$10$VzBZUkTg16Icng3E4Pib6u"
  );
  return res.send({
    salt: "$2a$10$VzBZUkTg16Icng3E4Pib6u0jGMON2zvOFq9Svo9187z6/XsdyJWDu",
    hash: hashB,
  });
};

const test = async (req, res) => {
  try {
    var source = req.headers["user-agent"];
    var clientIP = requestIP.getClientIp(req);
    var resultos = detector.parseOs(source);
    var resultclient = detector.parseClient(source);
    var resultdeviceType = detector.parseDeviceType(
      source,
      resultos,
      resultclient,
      {}
    );
    var ipaddress = clientIP.split("ffff:").pop();
    // console.log(ipaddress);
    var geo = geoip.lookup(ipaddress);
    if (geo == null) {
      // console.log("OS :" + resultos.name);
      // console.log("Browser : " + resultclient.name);
      // console.log("Device : " + resultdeviceType.type);
      // console.log("Country : localhost");
      // console.log("Ip address : " + ipaddress);

      res.status(200).send({ ipaddress: ipaddress, location: "localhost" });
    } else {
      // console.log("OS :" + resultos.name);
      // console.log("Browser : " + resultclient.name);
      // console.log("Device : " + resultdeviceType.type);
      // console.log("Country : " + geo);
      // console.log("Ip address : " + ipaddress);

      res.status(200).send({ ipaddress: ipaddress, location: geo.country });
    }
  } catch (e) {
    console.log("Test API error : " + e.message);
    res.status(500).send(`message:cannot provide this service at this time`);
  }
};

const signup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // console.log(errors);
      return res.status(400).json({ errors: errors.array() });
    } else {
      var username = req.body.username;
      var email = req.body.email;
      var password = req.body.password;
      var salt = req.body.salt;
      var clientIP = requestIP.getClientIp(req);
      var ipaddress = clientIP.split("ffff:").pop();
      var geo = geoip.lookup(ipaddress);
      var countryx = "";
      if (geo == null) {
        countryx = "LCH";
      } else {
        countryx = geo.country;
      }
      // console.log(countryx);
      var rdtoken = randomToken(32);

      pool.query(
        USER_MODEL.USER_SIGNUP_DETAILS,
        [username, email],
        (error, results) => {
          // console.log(error);
          // console.log(results);
          if (results) {
            console.log(results);
            var uid = results.rows[0].uid;
            pool.query(
              USER_MODEL.USER_SIGNUP_AUTH,
              [uid, username, email, salt, password, countryx],
              (error, results) => {
                // console.log(results);
                if (results) {
                  pool.query(
                    USER_MODEL.USER_SIGNUP_CONFIRM,
                    [uid],
                    (error, results) => {
                      // console.log(results);
                      if (results) {
                        pool.query(
                          USER_MODEL.USER_SIGNUP_GRANTS,
                          [uid, "confirm", rdtoken],
                          (error, results) => {
                            // console.log(results);
                            if (results) {
                              const request = mailjet
                                .post("send", { version: "v3.1" })
                                .request({
                                  Messages: [
                                    {
                                      From: {
                                        Email: "info@padmaraja.com",
                                        Name: "Padmaraja",
                                      },
                                      To: [
                                        {
                                          Email: email,
                                          Name: username,
                                        },
                                      ],
                                      TemplateID: 3498134,
                                      TemplateLanguage: true,
                                      Subject:
                                        "Padmaraja - Activate your account",
                                      Variables: {
                                        name: username,
                                        rdlink:
                                          "https://padmaraja.com/confirm/" +
                                          rdtoken,
                                      },
                                    },
                                  ],
                                });
                              request
                                .then((result) => {
                                  console.log(result.body);
                                  return res.status(200).send(req.body);
                                })
                                .catch((err) => {
                                  console.log(err.statusCode);
                                  return res.status(400);
                                });
                            } else {
                              return res.status(200).send(error);
                            }
                          }
                        );
                      } else {
                        return res.status(200).send(error);
                      }
                    }
                  );
                } else {
                  return res.status(200).send(error);
                }
              }
            );
          } else {
            return res.status(200).send(error);
          }
        }
      );

      // return res.status(200).send(req.body);
    }
  } catch (e) {
    console.log(e.message);
    return res
      .status(200)
      .send(`message:cannot provide this service at this time`);
  }
  // return res.status(200).send(req.body);
};

const validateEmail = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      var email = req.body.email;
      pool.query(
        USER_MODEL.USERS_GET_userid_by_email,
        [email],
        (error, results) => {
          // console.log(results);
          if (results.rows.length > 0) {
            return res.status(200).send({ value: true });
          } else {
            return res.status(200).send({ value: false });
          }
        }
      );
    }
  } catch (e) {
    console.log(e.message);
    return res
      .status(500)
      .send(`message:cannot provide this service at this time`);
  }
};

const validateUsername = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      var username = req.body.username;
      console.log("name :" + username);
      pool.query(
        USER_MODEL.USERS_GET_userid_by_name,
        [username],
        (error, results) => {
          // console.log(results);

          if (results.rows.length > 0) {
            return res.status(200).send({ value: true });
          } else {
            return res.status(200).send({ value: false });
          }
        }
      );
    }
  } catch (e) {
    console.log(e.message);
    return res
      .status(500)
      .send(`message:cannot provide this service at this time`);
  }
};

// try {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }
//   else {

//   }

// } catch (e) {
//   console.log(e.message);
//   return res.status(500).send(`message:cannot provide this service at this time`);
// }

const signupConfirmation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      var email = req.body.email;
      var token = req.body.token;
      pool.query(constants.updateVerified, [useremail], (error, results) => {
        if (error) {
          res.status(404).send("Bad Request");
        } else {
          res.status(200).send("Success");
        }
      });
    }
  } catch (e) {
    console.log(e.message);
    return res
      .status(500)
      .send(`message:cannot provide this service at this time`);
  }
};

const salt = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      var email = req.body.email;
      pool.query(USER_MODEL.USERLOGINS_GET_salt, [email], (error, results) => {
        if (error) {
          // console.log(error);
          res
            .status(500)
            .json({ message: "Cannot provide this service at this time" });
        } else {
          if (results.rows.length > 0) {
            var resultsalt = results.rows[0].salt;
            res.status(200).send({ salt: resultsalt });
          } else {
            res.status(404).json({ message: "User not found" });
          }
        }
      });
    }
  } catch (e) {
    console.log(e.message);
    return res
      .status(500)
      .send(`message:cannot provide this service at this time`);
  }
};
const showUserData = async (req, res) => {
  var token = req.body.token;

  pool.query(USER_MODEL.USERS_GET_USER, [token], (error, results1) => {
    if (error) {
      console.log();
      res
        .status(500)
        .json({ message: "Cannot provide this service at this time" });
    } else {
      if (results1.rows.length > 0) {
        pool.query(USER_MODEL.USERS_GET_LOGINS, [token], (error, results2) => {
          if (error) {
            console.log();
            res
              .status(500)
              .json({ message: "Cannot provide this service at this time" });
          } else {
            if (results2.rows.length > 0) {
              pool.query(
                USER_MODEL.USERS_GET_BIDS,
                [token],
                (error, results3) => {
                  if (error) {
                    console.log();
                    res.status(500).json({
                      message: "Cannot provide this service at this time",
                    });
                  } else {
                    if (results3) {
                      pool.query(
                        USER_MODEL.USERS_GET_ORDER,
                        [token],
                        (error, results4) => {
                          if (error) {
                            console.log();
                            res.status(500).json({
                              message:
                                "Cannot provide this service at this time",
                            });
                          } else {
                            if (results4) {
                              res.status(200).send({
                                user: results1.rows,
                                logs: results2.rows,
                                bids: results3.rows,
                                orders: results4.rows,
                              });
                            } else {
                              res
                                .status(404)
                                .json({ message: "User not found" });
                            }
                          }
                        }
                      );
                    } else {
                      res.status(404).json({ message: "User not found" });
                    }
                  }
                }
              );
            } else {
              res.status(404).json({ message: "User not found" });
            }
          }
        });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    }
  });
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      var regionVal = null;

      var source = req.headers["user-agent"];
      var clientIP = requestIP.getClientIp(req);
      var resultos = detector.parseOs(source);
      var resultclient = detector.parseClient(source);
      var resultdeviceType = detector.parseDeviceType(
        source,
        resultos,
        resultclient,
        {}
      );
      var ipaddress = clientIP.split("ffff:").pop();
      // console.log(ipaddress);
      var geo = geoip.lookup(ipaddress);
      if (geo == null) {
        regionVal = "LCH";
      } else {
        regionVal = geo.country;
      }

      var email = req.body.email;
      var password = req.body.password;
      var salt = req.body.salt;

      console.log(email + password + salt);

      pool.query(
        USER_MODEL.USER_LOGIN_VALIDATE,
        [email, password, salt],
        (error, results) => {
          // console.log("================= validate log =====================");
          // console.log(results);
          if (error) {
            res
              .status(500)
              .json({ message: "Cannot provide this service at this time" });
          } else {
            if (results.rows.length > 0) {
              var userid = results.rows[0].uid;
              var displayname = results.rows[0].displayname;
              var approval = results.rows[0].approval;
              var email_confirm = results.rows[0].email_confirm;
              let randy =
                Math.random().toString(20).substring(7, 20) + displayname;
              var acctoken = CryptoJS.AES.encrypt(
                randy,
                "lewdsstarsalfaechoxvids123"
              ).toString();

              pool.query(
                USER_MODEL.USER_LOGIN_INSERT,
                [
                  userid,
                  ipaddress,
                  resultclient.name,
                  resultos.name,
                  resultdeviceType.type,
                  acctoken,
                  regionVal,
                ],
                (error, results) => {
                  // console.log("=================login =====================");
                  // console.log(results);
                  if (error) {
                    res.status(500).json({
                      message: "Cannot provide this service at this time",
                    });
                  } else {
                    if (results) {
                      res.status(200).send({
                        username: displayname,
                        apr: approval,
                        ecf: email_confirm,
                        acs: acctoken,
                      });
                    } else {
                      res.status(404).json({ message: "User not found" });
                    }
                  }
                }
              );
            } else {
              res.status(404).json({ message: "User not found" });
            }
          }
        }
      );
    }
  } catch (e) {
    console.log(e.message);
    return res
      .status(500)
      .send(`message:cannot provide this service at this time`);
  }
};

const logout = async (req, res) => {};

const frogotPassword = async (req, res) => {
  try {
    var useremail = req.body.useremail;
    // var urival = req.body.uriv;
    var rdtoken = randomToken(32);

    pool.query(
      USER_MODEL.USER_FORGOT_GRANTS,
      [uid, "reset", rdtoken],
      (error, results) => {
        // console.log(results);
        if (results) {
          const request = mailjet.post("send", { version: "v3.1" }).request({
            Messages: [
              {
                From: {
                  Email: "info@padmaraja.com",
                  Name: "Padmaraja",
                },
                To: [
                  {
                    Email: email,
                    Name: username,
                  },
                ],
                TemplateID: 3498137,
                TemplateLanguage: true,
                Subject: "Account Password Reset",
                Variables: {
                  rdlink: "https://padmaraja.com/reset/"+rdtoken,
                },
              },
            ],
          });
          request
            .then((result) => {
              console.log(result.body);
              return res.status(200).send(req.body);
            })
            .catch((err) => {
              console.log(err.statusCode);
              return res.status(400);
            });
        } else {
          return res.status(200).send(error);
        }
      }
    );
  } catch (e) {
    console.log(e.message);
    return res
      .status(500)
      .send(`message:cannot provide this service at this time`);
  }
};

const frogotPasswordConfirmation = async (req, res) => {
  var rdtoken = req.body.rdtoken;
  var password = req.body.password;
  var cpassword = req.body.cpassword;

  if (cpassword == password) {
    pool.query(
      USER_MODEL.updatepass,
      [password, rdtoken],
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
    if (useremail != newemail) {
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
                    from: "support@industryseeker.com",
                    template_id: "d-51f641fca22440728cd9f649c357c9c9",
                    dynamic_template_data: {
                      username: valname.response,
                      resetlink: val,
                    },
                  };
                  const sendMessagePromise = sgMail.send(msg);

                  return Promise.all([sendMessagePromise])
                    .then(() => {
                      return res
                        .status(200)
                        .json({ Message: "Please enter 4 digit code" });
                    })
                    .catch((err) => {
                      return res.status(500);
                    });
                }
              }
            );
          }
        }
      );
    } else {
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

                  res.status(500).json({
                    message: "cannot provide this service at this time",
                  });
                } else {
                  console.log(results);

                  pool.query(
                    USER_MODEL.RESET_EMAIL_UPDATE_USERLOGIN,
                    [resultEmail, resultUserID],
                    (error, results) => {
                      if (error) {
                        console.log(error);
                        res.status(500).json({
                          message: "cannot provide this service at this time",
                        });
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
  pool.query(USER_MODEL.SIGNOUT_ME, [token], (error, results) => {
    if (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "cannot provide this service at this time" });
    } else {
      res.status(200).json({ Message: "Success" });
    }
  });
};

const signoutMobile = async (req, res) => {
  var token = req.body.token;
  var login_id = req.body.login_id;

  console.log(login_id);

  pool.query(USER_MODEL.SIGNOUT_IT_for_ME, [login_id], (error, results) => {
    if (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "cannot provide this service at this time" });
    } else {
      console.log(results);

      res.status(200).json({ Message: "Success" });
    }
  });
};

const signOutAll = async (req, res) => {
  var token = req.body.token;
  var login_id = req.body.login_id;
  pool.query(USER_MODEL.SIGNOUT_All, [token], (error, results) => {
    if (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "cannot provide this service at this time" });
    } else {
      res.status(200).json({ Message: "Success" });
    }
  });
};

const updateProfilePic = async (req, res) => {
  var token = req.body.token;
  // var profilepic = req.file.profilepic;

  console.log("token" + token);

  if (!req.files) return res.status(400).send("No files were uploaded.");

  var file = req.files.profilepic;
  var img_name = file.name;

  console.log(file);

  if (
    (file.mimetype == "image/jpeg" || file.mimetype == "image/png") &&
    img_name == "blob"
  ) {
    file.name = cc.generate();
    console.log(file);

    file.mv("public/images/upload_images/" + file.name, function (err) {
      if (err) {
        console.log(err);

        return res.status(500);
      } else {
        var final_img_name =
          "http://95.111.237.27:9000/images/upload_images/" + file.name;
        pool.query(
          USER_MODEL.UPDATE_PROFILE_pic,
          [final_img_name, token],
          (error, results) => {
            if (error) {
              console.log(error);
              res
                .status(500)
                .json({ message: "cannot provide this service at this time" });
            } else {
              res.status(200).json({ Message: "Success" });
            }
          }
        );
      }
    });
  } else {
    message =
      "This format is not allowed , please upload file with '.png','.jpg'";
    //  res.render('index.ejs',{message: message});
    res.status(400).json({ Message: "formate error" });
  }
};

const deleteUser = async (req, res) => {
  var token = req.body.token;
  var password = req.body.password;
  console.log(token + " fuck " + password);

  pool.query(USER_MODEL.DELETE_USER, [token, password], (error, results) => {
    if (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "cannot provide this service at this time" });
    } else {
      console.log("On deleteing ================================== ");
      console.log(results);
      if (results.rowCount == 1) {
        res.status(200).json({ Message: "Success" });
      } else {
        res.status(400).json({ Message: "Validation error" });
      }
    }
  });
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
        res
          .status(500)
          .json({ message: "cannot provide this service at this time" });
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

  console.log(
    token +
      " token " +
      address +
      " address " +
      state +
      " state " +
      country +
      " country " +
      postalcode +
      " postlacode " +
      city +
      " city " +
      contact +
      " conta " +
      email_invoicing +
      " email " +
      business_email
  );

  pool.query(
    USER_MODEL.BILLING_ADDRESS_UPDATE,
    [
      address,
      state,
      country,
      postalcode,
      city,
      contact,
      email_invoicing,
      business_email,
      token,
    ],
    (error, results) => {
      if (error) {
        console.log(error);
        res
          .status(500)
          .json({ message: "cannot provide this service at this time" });
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
        res
          .status(500)
          .json({ message: "cannot provide this service at this time" });
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

const testLogin = async (req, res) => {
  const { token } = req.body;
  // console.log(token);
  const ticket = await client.verifyIdToken({
    idToken: token,
    // audience: process.env.CLIENT_ID
    audience:
      "557552575655-q25lfde921g8n1gbmh1e42ikjndm4huv.apps.googleusercontent.com",
  });
  const { name, email, picture } = ticket.getPayload();
  // const user = await db.user.upsert({
  //     where: { email: email },
  //     update: { name, picture },
  //     create: { name, email, picture }
  // })
  res.status(201);
  // res.json(user)
  res.json({ name, email, picture });
};

const testMail = async (req, res) => {
  const { token } = req.body;
  console.log(token);
  const ticket = await client.verifyIdToken({
    idToken: token,
    // audience: process.env.CLIENT_ID
    audience:
      "557552575655-q25lfde921g8n1gbmh1e42ikjndm4huv.apps.googleusercontent.com",
  });
  const { name, email, picture } = ticket.getPayload();
  // const user = await db.user.upsert({
  //     where: { email: email },
  //     update: { name, picture },
  //     create: { name, email, picture }
  // })
  res.status(201);
  // res.json(user)
  res.json({ name, email, picture });
};

const userVerify = async (req, res) => {
  if (
    req.body.token == "" ||
    req.body.token == undefined ||
    req.body.token == null
  )
    return res.status(400).json({ message: "Validation error" });

  var token = req.body.token;
  //console.log(token + " in user verification process ");
  pool.query(USER_MODEL.VERIFY_USER, [token], (error, results) => {
    if (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "cannot provide this service at this time" });
    } else {
      // console.log(results.rowCount);

      if (results.rowCount == 1) {
        res.status(200).json({ data: "valied" });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    }
  });
};

const emailtest = async (req, res) => {
  /**
   *
   * This call sends a message to the given recipient with vars and custom vars.
   *
   */
  console.log("in email");
  //   const request = mailjet
  //   .post("send", { version: "v3.1" })
  //   .request({
  //     Messages: [
  //       {
  //         From: {
  //           Email: "info@padmaraja.com",
  //           Name: "Padmaraja",
  //         },
  //         To: [
  //           {
  //             Email: email,
  //             Name: username
  //           },
  //         ],
  //         TemplateID: 3498137,
  //         TemplateLanguage: true,
  //         Subject: "Account Password Reset",
  //         Variables: {
  //           rdlink:
  //             "https://padmaraja.com/reset/sddgsdv4564dfhgnfbfxb",
  //         },
  //       },
  //     ],
  //   });
  // request
  //   .then((result) => {
  //     res.status(200).send(result.body);
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
  // ================================================================================
  /**
   *
   * This call sends a message to the given recipient with vars and custom vars.
   *
   */
};

module.exports = {
  testcrypto,
  twotestcrypto,
  test,
  signup,
  validateEmail,
  validateUsername,
  showUserData,
  salt,
  login,
  emailtest,
  //------------------
  signupConfirmation,
  frogotPassword,
  frogotPasswordConfirmation,
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
  userVerify,
  testLogin,
};
