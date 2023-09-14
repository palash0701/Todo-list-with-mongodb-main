const express = require("express")
const bodyParser = require("body-parser")
const path = require("path")
const mongoose = require("mongoose")
const _=require("lodash")
const app = express();
app.use(bodyParser.urlencoded({ extended: true }))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.static("public"))


mongoose.connect('mongodb+srv://palashpaliwal25:SurbhiPalash@cluster0.nw1lcad.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
const itemsSchema = {
    name: String
}
const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item({
    name: "Write Essay"
})
const item2 = new Item({
    name: "Write Poem"
})
const item3 = new Item({
    name: "Write Song"
})

const defaultItems = [item1, item2, item3];


app.get("/", function (req, res) {

    Item.find().then(function (foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems).then(function () {
                console.log("Added");
            }).catch(function (err) {
                console.log(err);
            })
            res.redirect("/")
        }
        else {
            res.render("list", { listTitle: "Today", newListItems: foundItems })
        }
    })

})

const listSchema = {
    name: String,
    items: [itemsSchema]
}
const List = mongoose.model("List", listSchema);


app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({ name: customListName }).then(function (foundList) {

        if (!foundList) {
            const list = new List({
                name: customListName,
                items: defaultItems
            })
            list.save()
            res.redirect("/" + customListName)
        }
        else {
            res.render("list", { listTitle: foundList.name, newListItems: foundList.items })
        }
    })


})

app.post("/", function (req, res) {


    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name: itemName
    })


    if (listName === "Today") {
        item.save();
        res.redirect("/")
    }
    else {
        List.findOne({ name: listName }).then(function (foundList) {
            foundList.items.push(item)
            foundList.save()
            res.redirect("/" + listName)
        }
        )
    }
})

app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = _.capitalize(req.body.listName);
    if (listName === "Today") {
        Item.findByIdAndRemove({ _id: checkedItemId }).then(function () {

            res.redirect("/")
        })
    }
    else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }).then(function () {
            res.redirect("/" + listName)
        })
    }

})

app.listen("3000", function () {
    console.log("Server has been started");
})