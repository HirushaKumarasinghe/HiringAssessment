module.exports = Object.freeze({
    USER_SIGNUP_BEST:"with ins_sign_up as (INSERT INTO user_details(displayname, email) VALUES($1,$2) RETURNING uid), ins_sign_up2 as (INSERT INTO user_auth(uid, displayname, email, salt, password, region_created) VALUES((select uid from ins_sign_up), $1, $2, $3, $4, $5)), ins_sign_up3 as (INSERT INTO user_confirm(uid) VALUES((select uid from ins_sign_up))) INSERT INTO user_grants(uid, grant_type, token) VALUES((select uid from ins_sign_up), 'confirm', $6)",
    USER_SIGNUP_DETAILS:"INSERT INTO user_details(displayname, email) VALUES($1,$2) RETURNING uid",
    USER_SIGNUP_AUTH:"INSERT INTO user_auth(uid, displayname, email, salt, password, region_created) VALUES($1, $2, $3, $4, $5, $6)",
    USER_SIGNUP_CONFIRM:"INSERT INTO user_confirm(uid) VALUES($1)",
    USER_SIGNUP_GRANTS:"INSERT INTO user_grants(uid, grant_type, token) VALUES($1, $2, $3)",
    USER_FORGOT_GRANTS:"INSERT INTO user_grants(uid, grant_type, token) VALUES($1, $2, $3)",
    USER_LOGIN_VALIDATE:"select uid,displayname,approval,email_confirm FROM user_auth where email = $1 and password = $2 and salt = $3",
    USER_LOGIN_INSERT:"INSERT INTO user_logins (uid, ipaddress, browser, os, device, token, region_created) VALUES($1, $2, $3, $4, $5, $6, $7)",
    USERS_GET_userid_by_email: "SELECT uid FROM user_details where email = $1",
    USERS_GET_userid_by_name: "SELECT uid FROM user_details where displayname = $1",
    USERS_GET_USER: "SELECT displayname, fullname, email, contactregion, contact, country, address, addressline_one, addressline_two, city, state, postalcode, created_on FROM user_details where uid = (select uid from user_logins where token = $1)",
    USERS_GET_LOGINS: "SELECT ipaddress, browser, os, device, region_created, created_on from user_logins where uid = (select uid from user_logins where token = $1)",
    USERS_GET_BIDS: "SELECT gbt.gid, gbt.bid_amount, gbt.updated_on, gg.scat FROM gem_bid_timeline gbt,gem_gallery gg where uid = (select uid from user_logins where token = $1) and gbt.gid = gg.gid",
    USERS_GET_ORDER: "SELECT orderid, gid, mcat, qty, price, status, couriermethod, tracknumber, additional FROM order_details od where od.uid = (select uid from user_logins where token = $1)",
    
    USERS_POST_data: "INSERT INTO user_details (displayname, email) VALUES($1,$2)",
    USERLOGINS_POST_data: "INSERT INTO user_auth (uid, displayname, email, salt, password, region_created) VALUES(SELECT uid FROM user_auth where email = $1 , $2, $3, $4, $5, $6)",
    USERLOGINS_GET_salt: "SELECT salt FROM user_auth WHERE email = $1",
    USERS_GET_username_by_email: "SELECT displayname FROM user_auth where email = $1",
    getPasswordsByUseremail: "SELECT hash FROM user_auth WHERE email = $1",
    updatepass: "UPDATE user_auth SET hash = $1 WHERE email = $2",
    USERS_GET_data: "SELECT uid, profile_pic, displayname, fullname, email, contactregion, contact, country, address, addressline_one, addressline_two, city, state, postalcode, created_on FROM user_details where private_email = $1",
    LOGINSTATUS_GET: "select l.login_id ,l.browser, l.os,l.device,l.started_time ,l.region_code from loginstatus l where l.userid = $1",
    USERS_PUT_names: "update users set firstname = $1, lastname =$2 where private_email = $3",
    USER_PUT_OLDEMAIL: "update users set oldemail = $1 where private_email = $2",
    USER_PUT_NEWEMAIL: "update users set private_email = $1 where userid = $2",
    USERLOGINS_PUT_NEWEMAIL: "update users set private_email = $1 where userid = $2",
    LOGINSTATUS_ADD: "insert into loginstatus (userid,ipaddress,browser,os,device,token,attempts,region_code) values($1,$2,$3,$4,$5,$6,$7,$8)",
    USER_CONFIRMATIONS_ADD: "insert into user_confirmations(userid,type,token,forvalue) values($1,$2,$3,$4)",
    RESET_EMAIL_CONFIRM: "select uc.userid,uc.type,uc.forvalue from user_confirmations uc where uc.token = $1",
    RESET_EMAIL_UPDATE_USERS: "update users set private_email = $1 where userid = $2",
    RESET_EMAIL_UPDATE_USERLOGIN: "update userlogins set email = $1 where userid = $2",
    LOGINSTATUS_CurrentID: "select login_id from loginstatus where token = $1",
    SIGNOUT_ME: "DELETE FROM loginstatus WHERE token = $1",
    SIGNOUT_All: "DELETE FROM loginstatus WHERE userid = (select lo.userid from loginstatus lo where login_id = $1);",
    SIGNOUT_IT_for_ME: "DELETE FROM loginstatus WHERE login_id = $1",
    UPDATE_password: "update userlogins set hash = $1 where userid = (select lo.userid from loginstatus lo where lo.token = $2) and hash = $3",
    UPDATE_PROFILE_pic: "update users set profilepic = $1 where userid = (select lo.userid from loginstatus lo where lo.token = $2)",
    DELETE_USER: "DELETE FROM users WHERE userid = (select lo.userid from loginstatus lo where lo.token = $1) and userid = (select us.userid from userlogins us where hash = $2)",
    BILLING_DATA_GET: "select bd.billingid,bd.biller,bd.invoice,bd.amount,bd.title,bd.tokenCount,bd.date from billing_data bd where userid = (select lo.userid from loginstatus lo where lo.token = $1)",
    BILLING_ADDRESS_UPDATE: "update users set billing_address = $1,billing_state =$2,billing_country =$3,billing_postalcode =$4,billing_city =$5,contact =$6,email_invoicing=$7,business_email =$8 where userid = (select lo.userid from loginstatus lo where lo.token = $9)",
    COMPANY_UPDATE: "update users set company_name =$1 where userid = (select lo.userid from loginstatus lo where lo.token = $2)",
    VERIFY_USER: "select * from users u where u.userid = (select l.userid from loginstatus l where l.token = $1)",



});

//admin details 
// SELECT aid, profile_pic, displayname, fullname, email, contactregion, contact, created_on FROM admin_details
// INSERT INTO admin_details (profile_pic, displayname, fullname, email, contactregion, contact) VALUES("", "", "", "", "", "")
// UPDATE admin_details SET profile_pic="", displayname="", fullname="", email="", contactregion="", contact="" WHERE aid=0


//admin auth
// SELECT aid, displayname, email, salt, password, region_created FROM admin_auth
// INSERT INTO admin_auth (aid, displayname, email, salt, password, region_created) VALUES(0, "", "", "", "", "")
// UPDATE admin_auth SET displayname="", email="", salt="", "password"="", region_created="" WHERE aid=0

//admin logins
// SELECT aid, ipaddress, browser, os, device, token, region_created, created_on FROM admin_logins
// INSERT INTO admin_logins (aid, ipaddress, browser, os, device, "token", region_created) VALUES(0, "", "", "", "", "", "")
// DELETE FROM admin_logins WHERE aid=0



//user auth
// INSERT INTO user_auth (uid, displayname, email, salt, "password", region_created, approval) VALUES (0, "", "", "", "", "", false);
// UPDATE user_auth SET displayname="", email="", salt="", "password"="", region_created="", approval=false WHERE uid=0;
// DELETE FROM user_auth WHERE uid=0;
// SELECT uid, displayname, email, salt, "password", region_created, approval FROM user_auth;

//user confirm
// SELECT uid, face, front, back, authorized_licene FROM user_confirm;
// INSERT INTO user_confirm (face, front, back, authorized_licene) VALUES("", "", "", "");
// UPDATE user_confirm SET face="", front="", back="", authorized_licene="" WHERE uid=nextval("user_confirm_uid_seq"::regclass);
// UPDATE user_confirm SET face="", front="", back="", authorized_licene="" WHERE uid=nextval("user_confirm_uid_seq"::regclass);

//user details 
// SELECT uid, profile_pic, displayname, fullname, email, contactregion, contact, country, address, addressline_one, addressline_two, city, state, postalcode, created_on FROM user_details;
// INSERT INTO user_details (profile_pic, displayname, fullname, email, contactregion, contact, country, address, addressline_one, addressline_two, city, state, postalcode, created_on) VALUES("", "", "", "", "", "", "", "", "", "", "", "", "", CURRENT_TIMESTAMP);

//user grant
// INSERT INTO user_grants (uid, grant_type, "token") VALUES(0, "", "");



// ===================================

// --check email if exist
// select uid from user_details where email = $1
// --check username if exist
// select uid from user_details where displayname = $1
// --register
// with ins_sign_up as (INSERT INTO user_details(displayname, email) VALUES($1,$2) RETURNING uid), ins_sign_up2 as (INSERT INTO user_auth(uid, displayname, email, salt, password, region_created) VALUES((select uid from ins_sign_up), $1, $2, $3, $4, $5)), ins_sign_up3 as (INSERT INTO user_confirm(uid) VALUES((select uid from ins_sign_up))) INSERT INTO user_grants(uid, grant_type, token) VALUES((select uid from ins_sign_up), 'confirm', $6);
// --confirm password
// update user_auth set email_confirm = true 
// --approve user 
// update user_auth set approval = true 
// --login
// select salt from user_auth where email =$1 or displayname = $1
// select uid,displayname,email_confirm,approval from user_auth where email = $1 or displayname = $1 and password = $2
// INSERT INTO user_logins (uid, ipaddress, browser, os, device, token, region_created) VALUES($1, $2, $3, $4, $5, $6, $7);
// --reset password
// UPDATE user_auth SET password = $1 where uid = (select uid from user_logins where token = $2)
// --forget password insert
// select uid from user_auth where email =$1 or displayname =$1
// INSERT INTO user_grants (uid, grant_type, token) VALUES($1, 'forget', $2);
// --forget password update
// UPDATE user_auth SET password = $1 where uid = (select uid from user_grants where token = $1 and grant_type = 'forget')
// --update profile
// --bid
// INSERT INTO gem_bid_timeline (gid, bid_amount, uid) VALUES($1, $2, $3);
// --add to cart
// --pay - buy 
// --track bought
// --track bid
// --invoice
