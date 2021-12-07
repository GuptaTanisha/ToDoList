const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
const dotenv = require('dotenv');
const app = express();
dotenv.config()

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.eq40p.mongodb.net/todoDB?retryWrites=true&w=majority`, {useNewUrlParser: true});

const itemsSchema = {
  name: String
};
const Item = mongoose.model('Item',itemsSchema);

const item1 = new Item({
  name: "ToDo List"
});

const item2 = new Item({
  name: "Hit + to add"
});

const item3 = new Item({
  name: "Check the item to delete it"
});

const defaultItems = [item1,item2,item3];

const listSchema={
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model('List',listSchema);

app.get('/',(req,res) => {
  Item.find({},(err,foundItems) => {
    if(foundItems.length==0){
      Item.insertMany(defaultItems,(err) =>{
        if(err){
          console.log(err);
        }else{
          console.log("Successfully saved default items in DB");
        }
      })
      res.redirect("/");
    } else{
      res.render("list",{listTitle: "Today", newListItems: foundItems})
    }
  })
});

app.get("/:listName",(req,res) =>{
  const listName= _.capitalize(req.params.listName);
  List.findOne({name:listName},(err,foundList) => {
    if(foundList){
      res.render("list",{listTitle: listName,newListItems: foundList.items});
    }else{
      const list = new List({
        name: listName,
        items: defaultItems
      })
      list.save();
      res.redirect("/"+listName);
    }
  })
})

app.post("/",(req,res) =>{
  const itemName = req.body.newItem;
  const listName= req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName=="Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName},(err,foundList) =>{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }
})

app.post("/delete",(req,res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName=="Today"){
    Item.findByIdAndRemove(checkedItemId,(err) =>{
      if(!err){
        console.log("Successfully deleted");
        res.redirect("/");
      }
    })
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items:{_id:{checkedItemId}}}},(err,foundList) =>{
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }
})
app.listen(process.env.PORT || 3000, function() {
  console.log("Server started");
});
