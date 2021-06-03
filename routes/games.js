var express = require('express');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const asyncHandler = require('express-async-handler');

var router = express.Router();
router.use(awsServerlessExpressMiddleware.eventContext())




var pool = require('../database');

const mysql = require('mysql');

var con = mysql.createConnection({
  host: "raiseitonline.db.3362068.hostedresource.com",
  user: "raiseitonline",
  password: "Fantasy10!",
  database: "raiseitonline"
});



const getGames = async(req) => {

  let sql = `select * from scheduleresults 
  where year = '${req.query.year}' AND 
        week = '${req.query.week}'`;

  const result = await pool.query(sql); 
  if (result.length < 1) {
    throw new Error('No Games found');
  }
  return result;
}

/* GET users listing. */
router.get('/', asyncHandler(async (req, res, next) => {

  try{


    const games = await getGames(req);

    res.send(games);
  } catch(error){
    console.log(error);
    res.status(404);
    res.send('No Games Found');
  }

}));


router.get("/:id", function(req,res,next) {
  console.log('individual game' + req.params.id)
  console.log('week: ' + req.query.week);
  res.json({"id":12345,"homeTeam":"RUTG","visTeam":"IA"});
})

module.exports = router;