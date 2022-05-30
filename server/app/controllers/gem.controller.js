const GEM_MODEL = require("../db/models/gem.queries");
const pool = require("../db/postgresql");


const bid_to_gem = async (req, res) => {
    var gid = req.body.gid;
    var amount = req.body.amount;
    var token = req.body.token;

    console.log("we are so here"+gid+amount+token);

    pool.query(GEM_MODEL.BID_TO_GEM, [gid,amount,token], (error, results) => {
        if (error) {
            console.log(error);

            res.status(500).json({ message: "Cannot provide this service at this time" });
        } else {
            if (results) {
                pool.query(GEM_MODEL.UPDATE_GEM_PRICE, [amount,gid], (error, results) => {
                    if (error) {
                        console.log(error);
            
                        res.status(500).json({ message: "Cannot provide this service at this time" });
                    } else {
                        if (results) {
                            res.status(200).send({ price: amount });
                        } else {
                            res.status(404).json({ message: "not found" });
                        }
                    }
                });            } else {
                res.status(404).json({ message: "not found" });
            }
        }
    });

};

const get_current_bids = async (req, res) => {
    pool.query(GEM_MODEL.GET_ALL_GEMS, [], (error, results) => {
        if (error) {
            console.log(error);

            res.status(500).json({ message: "Cannot provide this service at this time" });
        } else {
            if (results.rows != null) {
                res.status(200).send({ gems: results.rows });
            } else {
                res.status(404).json({ message: "not found" });
            }
        }
    });
};

const get_latest_bid = async (req, res) => {
    pool.query(GEM_MODEL.GET_LATEST_GEM, [], (error, results) => {
        if (error) {
            console.log(error);

            res.status(500).json({ message: "Cannot provide this service at this time" });
        } else {
            if (results.rows != null) {
                res.status(200).send({ gems: results.rows });
            } else {
                res.status(404).json({ message: "not found" });
            }
        }
    });
};
const get_trend_four = async (req, res) => {
    pool.query(GEM_MODEL.GET_FOUR_TRENDING_GEM, [], (error, results) => {
        if (error) {
            console.log(error);

            res.status(500).json({ message: "Cannot provide this service at this time" });
        } else {
            if (results.rows != null) {
                res.status(200).send({ gems: results.rows });
            } else {
                res.status(404).json({ message: "not found" });
            }
        }
    });
};

const get_one_gem = async (req, res) => {
    var gid = req.body.gid;
    // console.log("haaai"+gid);
    pool.query(GEM_MODEL.GET_ONE_GEM, [gid], (error, results) => {
        if (error) {
            console.log(error);

            res.status(500).json({ message: "Cannot provide this service at this time" });
        } else {
            if (results.rows != null) {
                res.status(200).send({ gems: results.rows });
            } else {
                res.status(404).json({ message: "not found" });
            }
        }
    });
};
const get_one_gem_bids = async (req, res) => {
    var gid = req.body.gid;
    // console.log("haaai"+gid);
    pool.query(GEM_MODEL.GET_ONE_GEM_BID_TIMELINE, [gid], (error, results) => {
        if (error) {
            console.log(error);

            res.status(500).json({ message: "Cannot provide this service at this time" });
        } else {
            if (results.rows != null) {
                res.status(200).send({ gems: results.rows });
            } else {
                res.status(404).json({ message: "not found" });
            }
        }
    });
};

const sorting_data = async (req, res) => {
    pool.query(GEM_MODEL.GET_ALL_CATEGORIES + ";" + GEM_MODEL.GET_ALL_COLORS + ";" + GEM_MODEL.GET_ALL_SHAPES + ";" + GEM_MODEL.GET_ALL_TREATMENT + ";" + GEM_MODEL.GET_ALL_CLARITY + ";" + GEM_MODEL.GET_ALL_MINMAX, [], (error, results) => {
        if (error) {
            console.log(error);
            res.status(200).send({ category_array: null, colors_array: null, shapes_array: null });
        } else {
            if (results[0].rows != null) {
                res.status(200).send({ category_array: results[0].rows, colors_array: results[1].rows, shapes_array: results[2].rows, treats:results[3].rows,clarities:results[4].rows, minmax:results[5].rows });
            } else {
                res.status(200).send({ category_array: null, colors_array: null, shapes_array: null });
            }
        }
    });
};
const home_data_sale = async (req, res) => {
    pool.query(GEM_MODEL.GET_ON_SALE_MD + ";" + GEM_MODEL.GET_ON_SALE_SM, [], (error, results) => {
        if (error) {
            console.log(error);
            res.status(200).send({ sale_md: null, sale_sm: null });
        } else {
            if (results[0].rows != null) {
                res.status(200).send({ sale_md: results[0].rows, sale_sm: results[1].rows });
            } else {
                res.status(200).send({ sale_md: null, sale_sm: null });
            }
        }
    });
};
const home_data_trending = async (req, res) => {
    pool.query(GEM_MODEL.GET_ON_TRENDING_RECT + ";" + GEM_MODEL.GET_ON_TRENDING_SQR, [], (error, results) => {
        if (error) {
            console.log(error);
            res.status(200).send({ trend_rect: null, trend_sqr: null });
        } else {
            if (results[0].rows != null) {
                res.status(200).send({ trend_rect: results[0].rows, trend_sqr: results[1].rows });
            } else {
                res.status(200).send({ trend_rect: null, trend_sqr: null });
            }
        }
    });
};

const home_data_handpicked = async (req, res) => {
    pool.query(GEM_MODEL.GET_ON_HANDPICKED, [], (error, results) => {
        if (error) {
            console.log(error);
            res.status(200).send({ hand: null });
        } else {
            if (results.rows != null) {
                res.status(200).send({ hand: results.rows });
            } else {
                res.status(200).send({ hand: null });
            }
        }
    });
};

const gem_gallery = async (req, res) => {
    try {
        var mcat = "";
        var color = "";
        var shape = "";
        var search = "";
        var promotype = "buy|auction";
        var d_length_min = 0;
        var d_length_max = 1000000000;
        var d_width_min = 0;
        var d_width_max = 1000000000;
        var d_height_min = 0;
        var d_height_max = 1000000000;
        var price_min = 0;
        var price_max = 1000000000;
        var carat_min = 0;
        var carat_max = 1000000000;

        var pricesort = null;
        var caratsort = null;
        var timesort = null;

        var page = 1;
        var offset = 0;
        var query_statment = null;

        if (req.body.mcat != null) {
            mcat = req.body.mcat+"";
            mcat = mcat.replace(/,/g, "|");;
        }
        if (req.body.color != null) {
            color = req.body.color+"";
            color = color.replace(/,/g, "|");;
        }
        if (req.body.shape != null) {
            shape = req.body.shape+"";
            shape = shape.replace(/,/g, "|");;
        }
        if (req.body.search != null) {
            search = req.body.search;
        }
        if (req.body.promotype != null) {
            if (req.body.promotype == "auction") {
                promotype = "auction";
            }
            if (req.body.promotype == "buy") {
                promotype = "buy";
            }
        }
//d_length_min:,d_length_max:,d_width_min:,d_width_max:,d_height_min:,d_height_max:,price_min:,price_max:,carat_min:,carat_max:,
        if (req.body.d_length_min != null) {
            d_length_min = req.body.d_length_min;
        }
        if (req.body.d_length_max != null) {
            d_length_max = req.body.d_length_max;
        }
        if (req.body.d_width_min != null) {
            d_width_min = req.body.d_width_min;
        }
        if (req.body.d_width_max != null) {
            d_width_max = req.body.d_width_max;
        }
        if (req.body.d_height_min != null) {
            d_height_min = req.body.d_height_min;
        }
        if (req.body.d_height_max != null) {
            d_height_max = req.body.d_height_max;
        }
        if (req.body.price_min != null) {
            price_min = req.body.price_min;
        }
        if (req.body.price_max != null) {
            price_max = req.body.price_max;
        }
        if (req.body.carat_min != null) {
            carat_min = req.body.carat_min;
        }
        if (req.body.carat_max != null) {
            carat_max = req.body.carat_max;
        }


        if (req.body.pricesort != null) {
            pricesort = req.body.pricesort;
        }if (req.body.caratsort != null) {
            caratsort = req.body.caratsort;
        }if (req.body.timesort != null) {
            timesort = req.body.timesort;
        }

        if (req.body.page > 1) {
            page = req.body.page;
            offset = offset * (page - 1);
        }

        query_statment = GEM_MODEL.SORTED_GEMS;
        if (pricesort == "asc") {
            query_statment = GEM_MODEL.SORTED_GEMS_PRICE_LOW_TO_HIGH;
        }
        if (pricesort == "desc") {
            query_statment = GEM_MODEL.SORTED_GEMS_PRICE_HIGH_TO_LOW;
        }
        if (caratsort == "asc") {
            query_statment = GEM_MODEL.SORTED_GEMS_CARAT_LOW_TO_HIGH;
        }
        if (caratsort == "desc") {
            query_statment = GEM_MODEL.SORTED_GEMS_CARAT_HIGH_TO_LOW;
        }
        if (timesort == "asc") {
            query_statment = GEM_MODEL.SORTED_GEMS_OLDEST;
        }
        if (timesort == "desc") {
            query_statment = GEM_MODEL.SORTED_GEMS_LATEST;
        }
        
        // console.log(req.body);
        pool.query(query_statment, [mcat,color,shape,promotype,search,d_length_min,d_length_max,d_width_min,d_width_max,d_height_min,d_height_max,price_min,price_max,carat_min,carat_max,offset], (error, results) => {
            if (error) {
                console.log(error);
                res.status(500).send({ gems: null });
            } else {
                if (results.rows != null) {
                    res.status(200).send({ gems: results.rows });
                } else {
                    res.status(200).send({ gems: null });
                }
            }
        });
    } catch (e) {
        console.log(e.message);
        return res.status(500).send(`message:cannot provide this service at this time`);
    }
};

module.exports = {
    get_current_bids,
    get_latest_bid,
    get_one_gem,
    sorting_data,
    home_data_sale,
    home_data_trending,
    home_data_handpicked,
    gem_gallery,
    bid_to_gem,
    get_one_gem_bids
}