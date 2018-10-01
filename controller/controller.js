//dependencies
var express = require('express');
var router = express.Router();
var path = require('path');

//require request and cheerio to scrape
var request = require('request');
var cheerio = require('cheerio');

//Require models
var Comment = require('../models/Comment.js');
var Article = require('../models/Article.js');

//index
router.get('/', function(req, res) {
    res.redirect('/articles');
});

// A GET request to scrape the Verge website
router.get('/scrape', function(req, res) {
    // First, we grab the body of the html with request
    request('https://www.sciencedaily.com/news/computers_math/computer_programming/', function(error, response, html) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(html);
        var titlesArray = [];
        // Now, we grab every article
        $(".latest-head").each(function(i, element) {
            // Save an empty result object
            var result = {};

   
        // Add the text and href of every link, and save them as properties of the result object

        // result.headline = $(this).find('.latest-summary').text();

        result.title = $(this).children("a").text();
      
          
        result.link = $(this).children("a").attr("href");


            //no empty results get pushed to database
            if(result.title !== "" && result.link !== ""){
             //prevents duplicate 
                if(titlesArray.indexOf(result.title) == -1){
  
                  
                  titlesArray.push(result.title);
  
                 //Prevents duplicate articles, doesnt add if already exists 
                  Article.count({ title: result.title}, function (err, test){
                      //checks to see if good to save to database 
                    if(test == 0){
  
                      //new object using article module
                      var entry = new Article (result);
  
                     //save to mongo
                      entry.save(function(err, doc) {
                        if (err) {
                          console.log(err);
                        } else {
                          console.log(doc);
                        }
                      });
  
                    }
              });
          }
          // Log that scrape is working, just the content was missing parts
          else{
            console.log('Article already exists.')
          }
  
            }
            // Log that scrape is working, just the content was missing parts
            else{
              console.log('Not saved to DB, missing data')
            }
          });
        // after scrape, redirects to index
        res.redirect('/');
    });
});

//this will grab every article an populate the DOM
router.get('/articles', function(req, res) {
    //allows newer articles to be on top
    Article.find().sort({_id: -1})
        //send to handlebars
        .exec(function(err, doc) {
            if(err){
                console.log(err);
            } else{
                var artcl = {article: doc};
                res.render('index', artcl);
            }
    });
});

// This will get the articles we scraped from the mongoDB in JSON
router.get('/articles-json', function(req, res) {
    Article.find({}, function(err, dbarticle) {
        if (err) {
            console.log(err);
        } else {
            res.json(dbarticle);
        }
    });
});

//clear all articles for testing purposes
router.get('/clearAll', function(req, res) {
    Article.remove({}, function(err, doc) {
        if (err) {
            console.log(err);
        } else {
            console.log('removed all articles');
        }

    });
    res.redirect('/articles');
});

// Route for grabbing a specific Article by id, populate it with it's note
router.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    Article.findOne({ _id: req.params.id })
      // ..and populate all of the notes associated with it
      .populate("comment")
      .then(function(dbArticle) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });


  // Route for saving/updating an Article's associated Note
router.post("/articles/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    Article.Comment.create(req.body)
      .then(function(dbcomment) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return Article.findOneAndUpdate({ _id: req.params.id }, { comment: dbcomment._id }, { new: true });
      })
      .then(function(dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

module.exports = router;
























