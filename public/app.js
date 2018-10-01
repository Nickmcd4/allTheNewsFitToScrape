// Grab the articles as a json


$( document ).ready(function() {
    console.log( "ready!" );

$.getJSON("/articles-json", function(data) {
    // For each one
    for (var i = 0; i < data.length; i++) {
      // Display the apropos information on the page
    //  console.log("LOOK AT ME" + data[i]._id + data[i].title + data[i].link);
    }
  });


  var thisId = $("#idCatch").attr("data-id");

  $.ajax({
      method: "GET",
      url: "articles/" + thisId
  })

  .then(function(data){
      console.log(data);

      for (var i = 0; i < data.length; i++) {
        // Display the apropos information on the page
      //  console.log("LOOK AT ME" + data[i]._id + data[i].title + data[i].link);
     
        
      }
      $("#commentSection").prepend(data.comment[0].title);

      $("#commentSection").prepend(data.comment[0].body);
  })



});

$("#submitter").on("click", function(event){
    event.preventDefault();

    var thisId = $("#idCatch").attr("data-id");

    $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
            title: $("#titleinput").val(),

            body: $('#bodyinput').val()
        }
    })

    .then(function(data){
        console.log(data);


    })

    $('#titleinput').val("");
    $("#bodyinput").val("");
    console.log(thisId);
})