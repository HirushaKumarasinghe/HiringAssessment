// const {auth,authLead} = require('../middleware/auth')
const express = require('express');
const router = express.Router();

const { get_current_bids, get_latest_bid, get_one_gem, sorting_data, home_data_sale,
    home_data_trending,
    home_data_handpicked,gem_gallery,bid_to_gem,get_one_gem_bids } = require('../controllers/gem.controller');


// a simple test url to check that all of our files are communicating correctly.
// router.post('/test', search);
router.post('/live', gem_gallery);
router.get('/latest', get_latest_bid);
router.post('/gem', get_one_gem);
router.get('/sort', sorting_data);
router.get('/home/sale', home_data_sale);
router.get('/home/trend', home_data_trending);
router.get('/home/hand', home_data_handpicked);
router.post('/gallery', gem_gallery);

router.post('/bid', bid_to_gem);
router.post('/blist', get_one_gem_bids);


module.exports = router;