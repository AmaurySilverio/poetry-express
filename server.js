const express = require("express");
// const path = require("path");
const app = express();
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser"); // this is now built into express, we won't need it in the future-
const MongoClient = require("mongodb").MongoClient; // how we connect to db

var db, collection;

const url =
  "mongodb+srv://amaurycodes:Cofwp0oLYdFZk01x@cluster0.9qj4jet.mongodb.net/poetryDatabase?retryWrites=true&w=majority";
const dbName = "poetryDatabase";

app.listen(3001, () => {
  MongoClient.connect(
    url,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (error, client) => {
      if (error) {
        throw error;
      }
      db = client.db(dbName);
      console.log("Connected to `" + dbName + "`!");
    }
  );
});

app.set("view engine", "ejs");
app.use(fileUpload());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  db.collection("poems")
    .find()
    .toArray((err, result) => {
      if (err) return console.log(err);
      res.render("index.ejs", { entry: result });
    });
});

// app.post("/messages", function (req, res) {
//   console.log(req.files.upload);
//   const file = req.files.upload;
//   //console.log(file.name);
//   const filePath = path.join(__dirname, "public", "images", `${file.name}`);
//   console.log(filePath);
//   file.mv(filePath, (err) => {
//     if (err) return res.status(500).send(err);
//     res.redirect("/");
//   });
// });
app.post("/messages", (req, res) => {
  // console.log(req.body);
  let date = new Date();
  db.collection("poems").insertOne(
    {
      name: req.body.name.trim(),
      poem: req.body.poem,
      date: date,
      thumbUp: 0,
    },
    (err, result) => {
      if (err) return console.log(err);
      console.log("saved to database");
      res.redirect("/");
    }
  );
});
app.post("/messages/reply", (req, res) => {
  // console.log(req.body);
  let date = new Date();
  db.collection("poems").insertOne(
    {
      response: req.body.response,
      name: req.body.name.trim(),
      poem: req.body.poem,
      date: date,
      reply: true,
      thumbUp: 0,
    },
    (err, result) => {
      if (err) return console.log(err);
      console.log("saved to database");
      res.redirect("/");
    }
  );
  // db.collection("poems").insertOne({
  //   filename: req.files.upload.name,
  //   image_data: BinData(0, req.files.upload.data),
  // });
});

app.put("/messages/thumbUp", (req, res) => {
  console.log("moosy", req.body);
  db.collection("poems").findOneAndUpdate(
    { name: req.body.name.trim() },
    {
      $inc: {
        thumbUp: 1,
      },
    },
    {
      sort: { _id: -1 },
      upsert: false,
    },
    (err, result) => {
      if (err) return res.send(err);
      res.send(result);
    }
  );
});

app.delete("/delete", (req, res) => {
  console.log(req.body);
  let thumbUpNumber = Number(req.body.thumbsUpCount);
  db.collection("poems").findOneAndDelete(
    { poem: req.body.poem, thumbUp: thumbUpNumber },
    (err, result) => {
      console.log(err);
      if (err) return res.send(500, err);
      res.send("Message deleted!");
    }
  );
});
