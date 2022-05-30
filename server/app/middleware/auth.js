//Autherization middleware
const CryptoJS = require("crypto-js");

const pool = require("../db/postgresql");
const USER_MODEL = require("../db/models/user.queries");

const auth = async (req, res, next) => {
    try {
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
                        next();
                    } else {
                        res.status(401).json({ message: 'Please authenticate!' });
                    }
                }
            }
        );
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate!' })
    }
}

const cddSiyj = async (req, res, next) => {
    // console.log("cdd came");
    try {
        if (req.body.ctok == undefined || req.body.session == undefined)
            return res.status(400).json({ message: "Validation error" });
        if (req.body.ctok == "" || req.body.session == "")
            return res.status(400).json({ message: "Validation error" });

        var ctok = req.body.ctok;
        var session = req.body.session;
        // console.log(ctok+" and " + session);

        let vnext = CryptoJS.AES.decrypt(ctok, "lewdsstarsalfaechoxvids123").toString(CryptoJS.enc.Utf8);
        let cookietoken = CryptoJS.AES.decrypt(session, "lewdsstarsalfaechoxvids123").toString(CryptoJS.enc.Utf8);

        if(vnext.includes("y2BoK1XrUHxvdinethrugood255")){
            
            let warray = vnext.split("y2BoK1XrUHxvdinethrugood255");
            // console.log(vnext+" and " + cookietoken+" and " + warray[0]);
    
            if(cookietoken === warray[0]){
                next();
            }
            else{
                res.status(403).send({ message: 'Authentication successful!' })
            }
        }else{
            res.status(403).send({ message: 'Authentication successful!' })
        }

        
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate!' })
    }
}

const authLead = async (req, res, next) => {
    try {
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

                        pool.query(
                            USER_MODEL.USAGE_CHECK,
                            [token],
                            (error, results) => {
                                if (error) {
                                    console.log(error);
                                    res.status(500).json({ message: "cannot provide this service at this time" });
                                } else {
                                    // console.log(results.rowCount);
                                    if (results.rows[0].total_remaining > 0) {
                                        next();
                                    } else {
                                        res.status(403).json({ message: "Token limit exeeded!" });
                                    }
                                }
                            }
                        );
                    } else {
                        res.status(401).json({ message: 'Please authenticate!' });
                    }
                }
            }
        );
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate!' })
    }
}

module.exports = {auth,authLead,cddSiyj};