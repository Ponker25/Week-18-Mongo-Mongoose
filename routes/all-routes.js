var db = require("../models");
var Note = require("../models/Note.js");
var request = require("request");
var cheerio = require("cheerio");

module.exports = function(app) {

//GET request to render Handlebars pages
app.get("/", function(req, res) {
    db.Article.find({
        saved: false
    }).then(function (data, error) {
        console.log(error, "this is the error");
        console.log(data, "this is the data");
        var dbArticle = {
            article: data
        };
        console.log(dbArticle);
        res.render("home", dbArticle);
    })
});

app.get("/saved", function(req, res) {
    db.Article.find({
        saved: true
    }).populate("notes").then(function (articles, error) {
        console.log(articles);
        var dbArticle = {
            article: articles
        };
        res.render("saved", dbArticle);
    });
});

//  scrape the NYT website
app.get("/scrape", function(req, res) {

    request("https://www.nytimes.com/", function(error, response, html) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(html);
        var count = 0;
        // Now, get every h2 within an article tag, and do the following:
        $("div.css-6p6lnl").each(function (i, element) {
            count = i;
            // Save an empty result object
            var result = {};
            // Add the title and summary of every link, and save them as properties of the result object
            result.title = $(element).text();
            result.summary = $(element).find("p").text();
            result.link = $(element).children().attr("href");
            console.log(result);
            //save articles in database
            if (result.title && result.link && result.summary) {
                db.Article.create(result)
                    .then(function(dbArticle) {
                        // View the added result in the console
                        console.log(dbArticle);
                    })
                    .catch(function(err) {
                        return res.json(err);
                    });
            }
        });
        res.send("Scrape Complete");
    });
});

// Save an article
app.post("/articles/save/:id", function(req, res) {
    console.log("save article endpoint was hit");
    // Use the article id to find and update its saved boolean
    db.Article.findOneAndUpdate({
            "_id": req.params.id
        }, {
            saved: true
        })
        .then(result => {
            console.log(result);
            res.end()
        })
        .catch(err => res.json(err));
       
});

// Delete an article from 'Saved Article Page"
app.post("/articles/delete/:id", function(req, res) {
    // Use the article id to find and update its saved boolean to false
    db.Article.findOneAndUpdate({
            "_id": req.params.id
        }, {
            saved: false,
            notes: []
        })
        .then(result=> res.redirect('/'))// also to reload page  without deleted article
        .catch(err => res.json(err));
        
});

// Create a new note
app.post("/notes/save/:id", function(req, res) {
    console.log(req.body)
        // And save the new note in the db
    db.Note.create({
            body: req.body.text,
            article: req.params.id
        }).then(function (note, error) {
        if (error) {
            console.log(error);
        } else {
            // Use the article id to find and update it's notes
            db.Article.findOneAndUpdate({
                    "_id": req.params.id
                }, { $push: { notes: note._id } }, { new: true })
                .then(result=> res.redirect('/saved'))
                .catch(err => res.json(err));
                
        }
    });

});

// Delete a note
app.delete("/notes/delete/:note_id/:article_id", function(req, res) {
    // Use the note id to find and delete it
    db.Note.findOneAndRemove({
        "_id": req.params.note_id
    }, function(err) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
          console.log('req.params.note_id');
            db.Article.findOneAndUpdate({
                    "_id": req.params.article_id
                }, {
                    // removes from an existing array all instances of a value or values that match an ID.
                    $pull: {
                        "notes": req.params.note_id
                    }
                })
                .then(function() {console.log("then function");
                    res.sendStatus(200)})// also to reload page  without deleted article
                .catch(err => res.json(err));
                
                
        }
    });
});
}