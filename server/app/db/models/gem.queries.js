module.exports = Object.freeze({
    GET_ALL_GEMS: 'select * from gem_gallery ga, gem_images gi where ga.gid = gi.gid and ga.end_time > now()',
    //GET_LATEST_GEM : '    select * from gem_gallery ga, gem_images gi where ga.gid = gi.gid ORDER BY ga.gid desc LIMIT 1',
    GET_LATEST_GEM: 'select ga.gid,ga.carat,ga.mcat,ga.scat,ga.price,ga.d_height,ga.d_length,ga.d_width,gi.gif,gi.coverimg, extract(epoch from end_time)*1000 as remaining from gem_gallery ga, gem_images gi where ga.gid = gi.gid and ga.end_time > now()',
    // GET_LATEST_GEM: 'select ga.gid,ga.carat,ga.mcat,ga.scat,ga.price,ga.d_height,ga.d_length,ga.d_width,gi.gif,gi.coverimg, extract(epoch from end_time)*1000 as remaining from gem_gallery ga, gem_images gi where ga.gid = gi.gid and ga.end_time > now() order by ga.gid desc limit 8',
    GET_ONE_GEM: 'select * from gem_gallery ga, gem_images gi where ga.gid = gi.gid and ga.gid = $1',
    GET_ONE_GEM_BID_TIMELINE: 'select gbt.bid_amount, gbt.updated_on from gem_bid_timeline gbt where gbt.gid = $1',
    GET_FOUR_TRENDING_GEM: 'select ga.gid,ga.carat,ga.mcat,ga.scat,ga.price,ga.d_height,ga.d_length,ga.d_width,gi.gif,gi.coverimg, extract(epoch from end_time)*1000 as remaining from gem_gallery ga, gem_images gi where ga.gid = gi.gid ORDER BY ga.price desc limit 4',
    GET_ALL_CATEGORIES: 'select mo.mcat from gem_gallery gg, mcat_order mo where gg.mcat = mo.mcat group by mo.mcat,mo.orderid order by mo.orderid ASC',
    GET_ALL_SHAPES: 'select so.shape from gem_gallery gg, shape_order so where gg.shape = so.shape group by so.shape ,so.orderid order by so.orderid ASC',
    GET_ALL_COLORS: 'select gg.trade_colour from gem_gallery gg group by gg.trade_colour',
    GET_ALL_TREATMENT: 'select tr.treatments from gem_gallery gg, treatment_order tr where gg.treatments = tr.treatments group by tr.treatments ,tr.orderid order by tr.orderid ASC',
    GET_ALL_CLARITY: 'select co.clarity from gem_gallery gg, clarity_order co where gg.clarity = co.clarity group by co.clarity ,co.orderid order by co.orderid ASC',
    GET_ALL_MINMAX: 'select min(price) as price_min,max(price) as price_max, min(carat) as carat_min,max(carat) as carat_max, min(d_length) as length_min,max(d_length) as length_max, min(d_width) as width_min,max(d_width) as width_max, min(d_height) as height_min,max(d_height) as height_max from gem_gallery',
    
    GET_ON_SALE_MD: "select gp.gid, gp.promo_details, gp.cover_img, gg.mcat, gg.scat, gg.price, gg.carat from gem_promotions gp, gem_gallery gg where gp.promo_type='onsalerectmd' and gp.gid = gg.gid",
    GET_ON_SALE_SM: "select gp.gid, gp.promo_details, gp.cover_img, gg.mcat, gg.scat, gg.price, gg.carat from gem_promotions gp, gem_gallery gg where gp.promo_type='onsalerectsm' and gp.gid = gg.gid",
    GET_ON_TRENDING_RECT: "select gp.gid, gp.promo_details, gp.cover_img, gg.mcat, gg.scat, gg.price, gg.carat from gem_promotions gp, gem_gallery gg where gp.promo_type='trendingrect' and gp.gid = gg.gid",
    GET_ON_TRENDING_SQR: "select gp.gid, gp.promo_details, gp.cover_img, gg.mcat, gg.scat, gg.price, gg.carat from gem_promotions gp, gem_gallery gg where gp.promo_type='trendingsqr' and gp.gid = gg.gid",
    GET_ON_HANDPICKED: "select gp.gid, gp.promo_details, gp.cover_img, gg.mcat, gg.scat, gg.price, gg.carat from gem_promotions gp, gem_gallery gg where gp.promo_type='handpicked' and gp.gid = gg.gid",
    
    SORTED_GEMS: "SELECT count(gg.gid) OVER() AS full_count, gg.gid, gg.mcat, gg.scat, gg.price, gg.d_length, gg.d_width, gg.d_height, gg.carat, gg.end_time, gg.promo_type, gi.gif, gi.coverimg FROM gem_gallery gg, gem_images gi where gg.gid = gi.gid and gg.end_time > now() and gg.mcat similar to '%('||$1||')%' and gg.trade_colour similar to '%('||$2||')%' and gg.shape similar to '%('||$3||')%' and gg.promo_type similar to '%('||$4||')%' and gg.identification ILIKE '%'||$5||'%' and gg.d_length between $6 and $7 and gg.d_width between $8 and $9 and gg.d_height between $10 and $11 and gg.price between $12 and $13 and gg.carat between $14 and $15 LIMIT 40 OFFSET $16",
    SORTED_GEMS_PRICE_LOW_TO_HIGH: "SELECT count(gg.gid) OVER() AS full_count, gg.gid, gg.mcat, gg.scat, gg.price, gg.d_length, gg.d_width, gg.d_height, gg.carat, gg.end_time, gg.promo_type, gi.gif, gi.coverimg FROM gem_gallery gg, gem_images gi where gg.gid = gi.gid and gg.end_time > now() and gg.mcat similar to '%('||$1||')%' and gg.trade_colour similar to '%('||$2||')%' and gg.shape similar to '%('||$3||')%' and gg.promo_type similar to '%('||$4||')%' and gg.identification ILIKE '%'||$5||'%' and gg.d_length between $6 and $7 and gg.d_width between $8 and $9 and gg.d_height between $10 and $11 and gg.price between $12 and $13 and gg.carat between $14 and $15 order by gg.price asc LIMIT 40 OFFSET $16",
    SORTED_GEMS_PRICE_HIGH_TO_LOW: "SELECT count(gg.gid) OVER() AS full_count, gg.gid, gg.mcat, gg.scat, gg.price, gg.d_length, gg.d_width, gg.d_height, gg.carat, gg.end_time, gg.promo_type, gi.gif, gi.coverimg FROM gem_gallery gg, gem_images gi where gg.gid = gi.gid and gg.end_time > now() and gg.mcat similar to '%('||$1||')%' and gg.trade_colour similar to '%('||$2||')%' and gg.shape similar to '%('||$3||')%' and gg.promo_type similar to '%('||$4||')%' and gg.identification ILIKE '%'||$5||'%' and gg.d_length between $6 and $7 and gg.d_width between $8 and $9 and gg.d_height between $10 and $11 and gg.price between $12 and $13 and gg.carat between $14 and $15 order by gg.price desc LIMIT 40 OFFSET $16",
    SORTED_GEMS_CARAT_LOW_TO_HIGH: "SELECT count(gg.gid) OVER() AS full_count, gg.gid, gg.mcat, gg.scat, gg.price, gg.d_length, gg.d_width, gg.d_height, gg.carat, gg.end_time, gg.promo_type, gi.gif, gi.coverimg FROM gem_gallery gg, gem_images gi where gg.gid = gi.gid and gg.end_time > now() and gg.mcat similar to '%('||$1||')%' and gg.trade_colour similar to '%('||$2||')%' and gg.shape similar to '%('||$3||')%' and gg.promo_type similar to '%('||$4||')%' and gg.identification ILIKE '%'||$5||'%' and gg.d_length between $6 and $7 and gg.d_width between $8 and $9 and gg.d_height between $10 and $11 and gg.price between $12 and $13 and gg.carat between $14 and $15 order by gg.carat asc LIMIT 40 OFFSET $16",
    SORTED_GEMS_CARAT_HIGH_TO_LOW: "SELECT count(gg.gid) OVER() AS full_count, gg.gid, gg.mcat, gg.scat, gg.price, gg.d_length, gg.d_width, gg.d_height, gg.carat, gg.end_time, gg.promo_type, gi.gif, gi.coverimg FROM gem_gallery gg, gem_images gi where gg.gid = gi.gid and gg.end_time > now() and gg.mcat similar to '%('||$1||')%' and gg.trade_colour similar to '%('||$2||')%' and gg.shape similar to '%('||$3||')%' and gg.promo_type similar to '%('||$4||')%' and gg.identification ILIKE '%'||$5||'%' and gg.d_length between $6 and $7 and gg.d_width between $8 and $9 and gg.d_height between $10 and $11 and gg.price between $12 and $13 and gg.carat between $14 and $15 order by gg.carat desc LIMIT 40 OFFSET $16",
    SORTED_GEMS_LATEST: "SELECT count(gg.gid) OVER() AS full_count, gg.gid, gg.mcat, gg.scat, gg.price, gg.d_length, gg.d_width, gg.d_height, gg.carat, gg.end_time, gg.promo_type, gi.gif, gi.coverimg FROM gem_gallery gg, gem_images gi where gg.gid = gi.gid and gg.end_time > now() and gg.mcat similar to '%('||$1||')%' and gg.trade_colour similar to '%('||$2||')%' and gg.shape similar to '%('||$3||')%' and gg.promo_type similar to '%('||$4||')%' and gg.identification ILIKE '%'||$5||'%' and gg.d_length between $6 and $7 and gg.d_width between $8 and $9 and gg.d_height between $10 and $11 and gg.price between $12 and $13 and gg.carat between $14 and $15 order by gg.end_time desc LIMIT 40 OFFSET $16",
    SORTED_GEMS_OLDEST: "SELECT count(gg.gid) OVER() AS full_count, gg.gid, gg.mcat, gg.scat, gg.price, gg.d_length, gg.d_width, gg.d_height, gg.carat, gg.end_time, gg.promo_type, gi.gif, gi.coverimg FROM gem_gallery gg, gem_images gi where gg.gid = gi.gid and gg.end_time > now() and gg.mcat similar to '%('||$1||')%' and gg.trade_colour similar to '%('||$2||')%' and gg.shape similar to '%('||$3||')%' and gg.promo_type similar to '%('||$4||')%' and gg.identification ILIKE '%'||$5||'%' and gg.d_length between $6 and $7 and gg.d_width between $8 and $9 and gg.d_height between $10 and $11 and gg.price between $12 and $13 and gg.carat between $14 and $15 order by gg.end_time asc LIMIT 40 OFFSET $16",


    BID_TO_GEM: "INSERT INTO gem_bid_timeline(gid, bid_amount, uid) VALUES($1, $2, (select uid from user_logins where token = $3))",
    UPDATE_GEM_PRICE: "UPDATE gem_gallery SET price = $1 WHERE promo_type = 'auction' and gid = $2",
    
});

//gem details
// SELECT gid, mcat, scat, identification, price, weight, per_carat_price, color, color_intensity, trade_colour, transparency, shape, cut, d_length, d_width, d_height, clarity, origin, treatments, information, carat, extract(epoch from started_time)*1000 as started_time, extract(epoch from end_time)*1000 as end_time FROM gem_gallery
// INSERT INTO gem_gallery (mcat, scat, identification, price, weight, per_carat_price, color, color_intensity, trade_colour, transparency, shape, cut, d_length, d_width, d_height, clarity, origin, treatments, information, carat, end_time) VALUES('', '', '', 0, 0, 0, '', '', '', '', '', '', 0, 0, 0, '', '', '', '', 0, '');


//gem bid
// SELECT bid, gid, bid_amount, uid, updated_on FROM gem_bid_timeline
// INSERT INTO gem_bid_timeline (gid, bid_amount, uid) VALUES(0, 0, 0)
// and identification ILIKE '%||$7||%' 

//gem promo
// SELECT pid, gid, promo_type, promo_details, cover_img FROM gem_promotions

// SELECT pid, gid, promo_type, promo_details, cover_img FROM gem_promotions where promo_type = 'onsalerectsm' or promo_type = 'onsalerectmd'
// SELECT pid, gid, promo_type, promo_details, cover_img FROM gem_promotions where promo_type = 'trendingrect' or promo_type = 'trendingsqr'
// SELECT pid, gid, promo_type, promo_details, cover_img FROM gem_promotions where promo_type = 'handpicked'

// SELECT gid, mcat, scat, price, d_length, d_width, d_height, carat, end_time, promo_type
// FROM gem_gallery WHERE end_time > now() 
// and mcat similar to '%()%' 
// and trade_colour similar to '%()%' 
// and shape similar to '%()%'
// and promo_type similar to '%()%'
// and d_length between 0 and 1000
// and d_width between 0 and 1000
// and d_height between 0 and 1000
// and price between 0 and 1000000000
// and carat between 0 and 1000;

// order by price asc, carat asc, end_time asc;

// and ga.end_time > now()



// "SELECT gid, mcat, scat, price, d_length, d_width, d_height, carat, end_time, promo_type FROM gem_gallery WHERE end_time > now() and mcat similar to '%('||$1||')%' and trade_colour similar to '%('||$2||')%' and shape similar to '%('||$3||')%' and promo_type similar to '%('||$4||')%' and d_length between $7 and $7 and d_width between $8 and $9 and d_height between $10 and $11 and price between $12 and $13 and carat between $14 and $15";
