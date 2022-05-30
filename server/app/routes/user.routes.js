// const {auth} = require('../middleware/auth')
// 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
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { cddSiyj } = require('../middleware/auth');

// Require the controllers WHICH WE DID NOT CREATE YET!!
const {
    test,
    twotestcrypto,
    testcrypto,
    signup,
    validateEmail,
    validateUsername,
    // signupConfirmation,
    salt,
    login,
    // frogotPassword,
    // frogotPasswordConfirmation,
    showUserData,
    // updateUserNames,
    // updateEmail,
    // verifyUpdatedEmail,
    // signout,
    // signoutMobile,
    // signOutAll,
    // updateProfilePic,
    // deleteUser,
    // updatePassword,
    // updateBillingAddress,
    // updateCompanyName,
    // userVerify,
    testLogin,emailtest

} = require('../controllers/user.controller');


router.get('/etest', emailtest);
router.get('/gemlist', testcrypto);
router.post('/ttest',cddSiyj, twotestcrypto);
// router.post('/signupc',auth, signupConfirmation);
router.post('/signup',body('email').isEmail().normalizeEmail(), body('password').isLength({ min: 8 }), cddSiyj, signup);
router.post('/vemail', body('email').isEmail().normalizeEmail(), validateEmail);
router.post('/vname', validateUsername);

router.post('/salt', body('email').isEmail().normalizeEmail(), salt);
router.post('/login',body('email').isEmail().normalizeEmail(), body('password').isLength({ min: 8 }),login);
// router.post('/forgot', frogotPassword);
// router.post('/forgotc', frogotPasswordConfirmation);
// router.post('/authreqverify',backEndVerification);
router.post('/user',cddSiyj,showUserData);
// router.post('/usage',auth, showUsage);
// router.post('/usage/summary',auth, showUsageSummary);
// router.post('/package',auth, userPackage);
// router.post('/user/s/follow',auth, followCompany);
// router.post('/user/u/follow',auth, unFollowCompany);
// router.post('/user/auth',auth, userVerify);

// router.post('/b/packages',auth, basicPackages);
// router.post('/s/packages',auth, subPackages);

// router.post('/user',showUserData);
// router.post('/s/name',auth, updateUserNames);
// router.post('/s/email',auth, updateEmail);
// router.post('/v/email',auth, verifyUpdatedEmail);
// router.post('/u/sout',auth, signout);
// router.post('/m/sout',auth, signoutMobile);
// router.post('/g/sout',signOutAll);
// router.post('/s/pic',auth, updateProfilePic);
// router.post('/d/user',auth, deleteUser);
// router.post('/s/password',auth, updatePassword);
// router.post('/s/billing',auth, updateBillingAddress);
// router.post('/s/company',auth, updateCompanyName);



router.post('/v1/auth/google', testLogin);




// router.get('/g/coupon',auth, generateCoupon);
// router.post('/v/coupon',auth, validateCoupon);





module.exports = router;


// source /home/newfnohp/nodevenv/backend/14/bin/activate && cd /home/newfnohp/backend