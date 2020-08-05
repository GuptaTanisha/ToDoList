const express = require('express');
const bodyParser = require('body-parser');
const app= express();
var items=['Eat Food','Watch TV'];
app.set('view engine','ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
var item;
app.get('/',function(req,res)
{
var today=new Date();
var options={
  day:"numeric",month:"long",year:"numeric"
};
var day=today.toLocaleDateString("en-US",options);
res.render('list',{kindOfDay:day,newItemsList:items});
})


app.post('/',function(req,res)
{
  item=req.body.newItem;
 items.push(item);
  res.redirect('/');

})

app.listen(3000,function()
{
  console.log("Server is running at port 3000");
})
