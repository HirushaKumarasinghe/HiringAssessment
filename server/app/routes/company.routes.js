const {auth,authLead} = require('../middleware/auth')
const express = require('express');
const router = express.Router();

// Require the controllers WHICH WE DID NOT CREATE YET!!
const {
    getCompanyDescription,
    query_parameters,
    rapid_search,
    sectors_and_locations,
    getInterestedCompanyKeywords,
    getInterestedCompanyList,
    search_mongoVersion,
    getCompanyById,
    getCompanyContactsById,
    getCompanyComposById} = require('../controllers/company/index');


// a simple test url to check that all of our files are communicating correctly.
// router.post('/test', search);
router.post('/queries',query_parameters);
router.post('/rs',rapid_search);
router.post('/f/data',sectors_and_locations);

router.post('/user/following',auth, getInterestedCompanyList);
router.post('/user/following/keys',auth, getInterestedCompanyKeywords);
router.post('/search',authLead, search_mongoVersion);
router.post('/id', getCompanyById);
router.post('/id/contacts',authLead, getCompanyContactsById);
router.post('/id/competitors',auth, getCompanyComposById);
router.post('/dec',getCompanyDescription);


module.exports = router;