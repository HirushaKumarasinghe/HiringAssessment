const signup = async (req, res) => {
  try {
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var useremail = req.body.useremail;
    var password = req.body.password;
    var cpassword = req.body.cpassword;
    var salt = req.body.salt;
    var accept_tos = req.body.accept_tos;

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