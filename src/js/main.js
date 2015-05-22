/*jshint unused: true, node: true */
/*jslint unparam: true, node: true */
/*jshint -W117 */ /*jshint -W098 */
var omdb_URL = 'http://www.omdbapi.com/?';
var $searchForm = $('.search-form');
var $searchBar = $('input[name=search]')[0];
var FIREBASE_URL = "https://eamdb.firebaseio.com/eamdb.json";
var $movieDetails = $(".movie-details");
var $table = $("table");

//function to get firebase data and add to table on page load
$.get(FIREBASE_URL, function(data){
    if (data===null){
    $table.hide(); //hides table if firebase is empty
  }else{
    Object.keys(data).forEach(function(id){
      addTableDetail(data[id], id);
    });
  }
});


//function to retrieve movie JSON file and add to html
$searchForm.on('submit', function(){
  var movie = $searchBar.value;
  var url = omdb_URL + "t=" + movie + "&r=json";
  console.log(url);
  $.get(url, function(data){
    addMovieDetail(data);
  });
  return false;
});


//function to add JSON data to html
function addMovieDetail(data){
  var $target = $(".movie-details");

  if (data.Title === undefined) {
    $target.empty();
    $target.append("<h2>Sorry, never heard of it!</h2>");
  } else {
    var poster = data.Poster === "N/A" ? "http://i.imgur.com/rXuQiCm.jpg?1" : data.Poster;
    $target.empty();
    $target.append("<img src=" + poster + "></img>");
    $target.append("<h1>" + data.Title + "</h1>");
    $target.append("<h2> Year: " + data.Year + "</h2>");
    $target.append("<h2> IMDB Rating: " + data.imdbRating + "</h2>");

    $target.append("<button class='btn btn-default btn-xs add-movie'>Add Movie</button>");
    }
}

//posts movie object to firebase and calls addTableDetail()
$movieDetails.on('click', '.add-movie', function() {
  //note: must be in this format because the .add-movie button is dynamically created
  var movie = $searchBar.value;
  var url = omdb_URL + "t=" + movie + "&r=json";
  $.get(url, function (data) {
    $.post(FIREBASE_URL, JSON.stringify(data), function(res){
      addTableDetail(data, res.name);
      });
    }, 'jsonp');
 });

//function to append a row to the table
function addTableDetail(data, id){
  $table.show();
  $table.append("<tr class='hide-rows'></tr>");
  var $target = $("tr:last");
  $target.attr("data-id", id);
  var poster = data.Poster === "N/A" ? "http://i.imgur.com/rXuQiCm.jpg?1" : data.Poster;
  $target.append("<td class=\"poster\"><img src=" + poster + "></img></td>");
  $target.append("<td class=\"title\">"+ data.Title +"</td>");
  $target.append("<td class=\"year\">"+ data.Year +"</td>");
  $target.append("<td class=\"rating\">"+ data.imdbRating +"</td>");
  $target.append("<td><button class='btn btn-default btn-xs'>"+ "&nbsp;X&nbsp;" +"</button></td>");
}


//deletes row from table and firebase
$table.on('click', 'button', function(){
  var $movie = $(this).closest('tr');
  var $id = $movie.attr('data-id');
  $movie.remove();
  var deleteURL = FIREBASE_URL.slice(0, -5) + '/' + $id + '.json';
  $.ajax({
  url: deleteURL,
  type: 'DELETE'
  });
});


