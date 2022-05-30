//Autherization middleware
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

module.exports = {auth,authLead};