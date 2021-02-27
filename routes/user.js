var express = require('express');
var router = express.Router();

router.get('/',(req,res)=>{
  res.send('Hello world, whith a smile ')
})

module.exports = router;
