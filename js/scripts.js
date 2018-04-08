$(function() {
  loadHome();
});
$("#home").click(loadHome);
$("#recentAddedMovie").click(function(event) {
  var recents = JSON.parse(localStorage.getItem("recentAddedMovies"));
  debugger;
  var queryParams = [];
  if(recents){
    for (let i = 0; i < recents.length; i++) {
      queryParams.push("id=" + recents[i]);
    }
    request().getData(queryParams, "Recently Added movies");
  }else{
    alert('No movie added.Please add new movies')
  }

});
function loadHome() {
  request().getData(["_page=1", "_limit=10"], "Top 10 movies of all time");
}
$("#search-form").submit(function(event) {
  var searchString = $("#search-input").val();
  event.preventDefault();
  request().getData(["q=" + searchString]);
});

$(" .delete").click(function(event) {
  debugger;
  confirm(
    "Do you want to delete" +
      $(this)
        .last()
        .children("h3")
        .html()
  );
  //   request().deleteData($(this).attr("movie-id"));
});

$("#addMovie").click(function(event) {
  $("#modalAdd").removeClass("hide");
  $("#addMovieModal").click(function(event) {
    request().addData({
      title: $("#add-title").val(),
      year: $("#add-year").val(),
      image: $("#add-image").val()
    });
  });
});
$("#closeModal").click(function(event) {
  $("#modalAdd").addClass("hide");
});

function updateDom(data, header) {
  debugger;
  $(".section").html(
    '<div class="movieheader"></div> <div class="results"> </div>'
  );
  if (!data.length) {
    $(".movieheader").html("<h1> No Results Found</h1>");
  } else {
    if (header) {
      $(".movieheader").html("<h1>" + header + "</h1>");
    } else {
      $(".movieheader").html("<h1>" + data.length + " Results Found</h1>");
    }
  }

  for (var i = 0; i < data.length; i++) {
    $(".results").append(
      $(
        '<div class="thumbnail"><i class="delete fa fa-close" movie-id="' +
          data[i].id +
          '" movie-name="' +
          data[i].title +
          '"></i><div class="image-div"><img src="' +
          data[i].image +
          '"> </div><div class="thumbnail-content"><h3>' +
          data[i].title +
          "</h3> <h4>" +
          data[i].year +
          "</h4> </div> </div>"
      )
    );
    data[i];
  }
}

function request() {
  var api = "http://localhost:3000/list";
  var data;
  function getData(searchParams, header) {
    var url = api + "?";
    for (let i = 0; i < searchParams.length; i++) {
      url += searchParams[i] + "&";
    }
    $.ajax({
      url: url,
      type: "GET",
      crossDomain: true,
      success: function(data) {
        // console.log(data);
        updateDom(data, header);
        $(" .delete").click(function(event) {
          debugger;
          if (confirm("Do you want to delete" + $(this).attr("movie-name"))) {
            request().deleteData($(this).attr("movie-id"), this);
          } else {
            return false;
          }
        });
      },
      error: function() {
        console.log("failed to search!");
      }
    });
  }
  function addData(data) {
    //   console.log(data)
    var message = "";
    for (var i in data) {
      if (!data[i]) {
        message += " " + i;
      }
    }
    if (message !== "") {
      if (!confirm(message + " is empty.Do you still want to add movie")) {
        return false;
      }
    }
    $.ajax({
      url: api,
      type: "POST",
      dataType: "json",
      data: data,
      crossDomain: true,
      success: function(data) {
        // console.log(data);
        debugger;
        var recent = localStorage.getItem("recentAddedMovies");
        if (!recent) {
          recent = [data.id];
        } else {
          var recent = JSON.parse(recent);
          recent.unshift(data.id);
        }
        if (recent.length > 10) {
          recent.length = 10;
        }
        localStorage.setItem("recentAddedMovies", JSON.stringify(recent));
      },
      error: function() {
        console.log("failed to Add!");
      }
    });
  }
  function deleteData(id, that) {
    $.ajax({
      url: api + "/" + id,
      type: "DELETE",
      crossDomain: true,
      success: function(data) {
        // console.log(data);
        $(that)
          .parent()
          .remove();
      },
      error: function() {
        console.log("failed to Delete!");
      }
    });
  }
  return {
    getData: getData,
    addData: addData,
    deleteData: deleteData
  };
}
