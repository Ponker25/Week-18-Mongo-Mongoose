
$("#loadArticles").on("click", function(event) {
    event.preventDefault();
    $.ajax({
        method: "GET",
        url: "/scrape",
    }).then(function(data) {
        console.log(data)
        alert("You have scraped 20 new articles")
        window.location = "/"
    })
});

// Save Article button
$(".save").on("click", function(event) {
    event.preventDefault();
    var thisId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/articles/save/" + thisId
    }).then(function(data) {
        window.location = "/"
    })
});

/// Delete Article button
$(".delete").on("click", function(event) {
    event.preventDefault();
    var thisId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/articles/delete/" + thisId
    }).then(function(data) {
        window.location = "/saved"
    })
});

// Save Note button
$(".saveNote").on("click", function(event) {
    event.preventDefault();
    var thisId = $(this).attr("data-id");
    if (!$("#noteText" + thisId).val()) {
        alert("Please enter a note")
    }else {
      $.ajax({
            method: "POST",
            url: "/notes/save/" + thisId,
            data: {
              text: $("#noteText" + thisId).val()
            }
          }).then(function(data) {
              console.log(data);
              // check if the notes section is empty
              $("#noteText" + thisId).val("");
              $(".modalNote").modal("hide");
              window.location = "/saved"
              
          });
    }
});

// Delete Note button
$(".notesDeleteButton").on("click", function(event) {
    event.preventDefault();
    var noteId = $(this).attr("data-note-id");
    var articleId = $(this).attr("data-article-id");
    $.ajax({
        method: "DELETE",
        url: "/notes/delete/" + noteId + "/" + articleId
    }).then(function(data) {
        console.log(data)
        window.location = "/saved"
       
    })
});
