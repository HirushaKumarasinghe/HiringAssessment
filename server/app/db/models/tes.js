module.exports = Object.freeze({
    USERS_GET_email_by_email : 'SELECT private_email FROM users WHERE private_email= $1',
    USERS_POST_data : 'INSERT INTO users (firstname,lastname,company_name,private_email,business_email,contact) VALUES ($1,$2,$3,$4,$5,$6)',
    USERS_GET_userid_by_email: 'SELECT userid FROM users where private_email = $1',
    USERLOGINS_POST_data : 'INSERT INTO userlogins (userid,username,email,salt,hash,region_created)VALUES($1,$2,$3,$4,$5,$6)',
    USERLOGINS_GET_salt : 'SELECT salt FROM userlogins WHERE email = $1',
    USERS_GET_username_by_email: 'SELECT firstname FROM users where private_email = $1',
    getPasswordsByUseremail : 'SELECT hash, salt FROM userlogins WHERE email = $1',
    updatepass: 'UPDATE userlogins SET hash = $1 WHERE email = $2',
    USERS_GET_data : 'select u.userid, u.firstname, u.lastname , u.profilepic , u.billing_address , u.billing_state , u.billing_country ,u.billing_postalcode ,u.billing_city, u.company_name , u.private_email ,u.business_email ,u.contact,u.email_invoicing from users u where private_email = $1',
    LOGINSTATUS_GET : 'select l.login_id ,l.browser, l.os,l.device,l.started_time ,l.region_code from loginstatus l where l.userid = $1',
    USERS_PUT_names: 'update users set firstname = $1, lastname =$2 where private_email = $3',
    USER_PUT_OLDEMAIL : 'update users set oldemail = $1 where private_email = $2',
    USER_PUT_NEWEMAIL : 'update users set private_email = $1 where userid = $2',
    USERLOGINS_PUT_NEWEMAIL : 'update users set private_email = $1 where userid = $2',
    LOGINSTATUS_ADD: 'insert into loginstatus (userid,ipaddress,browser,os,device,token,attempts,region_code) values($1,$2,$3,$4,$5,$6,$7,$8)',
    USER_CONFIRMATIONS_ADD:'insert into user_confirmations(userid,type,token,forvalue) values($1,$2,$3,$4)',
    RESET_EMAIL_CONFIRM:'select uc.userid,uc.type,uc.forvalue from user_confirmations uc where uc.token = $1',
    RESET_EMAIL_UPDATE_USERS:'update users set private_email = $1 where userid = $2',
    RESET_EMAIL_UPDATE_USERLOGIN:'update userlogins set email = $1 where userid = $2',
    LOGINSTATUS_CurrentID :'select login_id from loginstatus where token = $1',
    SIGNOUT_ME :'DELETE FROM loginstatus WHERE token = $1',
    SIGNOUT_All :'DELETE FROM loginstatus WHERE userid = (select lo.userid from loginstatus lo where login_id = $1);',
    SIGNOUT_IT_for_ME :'DELETE FROM loginstatus WHERE login_id = $1',
    UPDATE_password :'update userlogins set hash = $1 where userid = (select lo.userid from loginstatus lo where lo.token = $2) and hash = $3',
    UPDATE_PROFILE_pic : 'update users set profilepic = $1 where userid = (select lo.userid from loginstatus lo where lo.token = $2)',
    DELETE_USER:'DELETE FROM users WHERE userid = (select lo.userid from loginstatus lo where lo.token = $1) and userid = (select us.userid from userlogins us where hash = $2)',
    BILLING_DATA_GET:'select bd.billingid,bd.biller,bd.invoice,bd.amount,bd.title,bd.tokenCount,bd.date from billing_data bd where userid = (select lo.userid from loginstatus lo where lo.token = $1)',
    BILLING_ADDRESS_UPDATE:'update users set billing_address = $1,billing_state =$2,billing_country =$3,billing_postalcode =$4,billing_city =$5,contact =$6,email_invoicing=$7,business_email =$8 where userid = (select lo.userid from loginstatus lo where lo.token = $9)',
    VERIFY_USER:'select * from users u where u.userid = (select l.userid from loginstatus l where l.token = $1)',


});


//check if user is there
//add user
    //add salt password
    //send confirmation email

//check if user is there
    //select user password email matching raw
    //generate token and store
    //give it to front

