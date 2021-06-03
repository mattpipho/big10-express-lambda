var express = require('express');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
var router = express.Router();
router.use(awsServerlessExpressMiddleware.eventContext())

var pool = require('../database');
const asyncHandler = require('express-async-handler');



const getPlayerStats = async(req) => {

//,w1,w2,w3,w4,w5,w6,w7,w8,w9,w10,w11,w12,w13,w14
  let sql = `select pi.playerid,lastname,team,position,sum_pts,max_pts,avg_pts,w1,w2,w3,w4,w5,w6,w7,w8,w9,w10,w11,w12,w13,w14
               from ( select playerid,lastname,team,position
                        from playerinfo
                       where year = '${req.query.year}') as pi join 
                    ( select playerid,sum(points) as sum_pts,max(points) as max_pts,avg(points) as avg_pts
                        from playerstats
                       where year = '${req.query.year}'
                    group by playerid) cs on pi.playerid = cs.playerid `;
 //                   sql += `left join (select playerid,points as w1 from playerstats where week = 1) as week_1 
 //                   on cs.playerid = week_1.playerid `;

  
  for(let w = 1; w<=14; w++){
    sql += `left join (select playerid,points as w${w} from playerstats where week = ${w} and year = '${req.query.year}') as week_${w} 
                       on cs.playerid = week_${w}.playerid `;
  }

  sql += `order by avg_pts desc`;

  //console.log('sql: ' + sql);

// return [{"year":2019,"playerid":12345}];
  
  const result = await pool.query(sql); 
  console.log(result.length);
  if (result.length < 1) {
    throw new Error('No Stats found');
  }
  return prepareStats(result);

}

function prepareStats(result) {

  return result;
  //console.log(result.length);
  /*
  let f = result.filter((value) => {
    return value.team == "IA";
  })


  f.sort((a,b) => {
    if(a.position > b.position){
      return -1;
    } else if((a.position < b.position)) {
      return 1;
    } else {
      return 0;
    }
  })

  return f;
  */


}




/* GET users listing. */
router.get('/', asyncHandler(async (req, res, next) => {

console.log('before');

  let playerStats = await getPlayerStats(req);

  console.log('after');
  res.send(playerStats);

  //res.send(playerStats.filter((v) => v.team == 'IA' ));

}));

module.exports = router;