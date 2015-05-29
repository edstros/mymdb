/*jshint unused: true, node: true */
/*jslint unparam: true, node: true */
/*jshint -W117 */ /*jshint -W098 */

var omdb_URL = 'http://www.omdbapi.com/?';
var $searchForm = $('.search-form');
var $searchBar = $('input[name=search]')[0];
var FIREBASE_URL = "https://eamdb.firebaseio.com/";
var fb = new Firebase(FIREBASE_URL);
var movies;
var $movieDetails = $(".movie-details");
var $table = $("table");
var initLoad = true;
var authData = fb.getAuth();

console.log(authData);


///////////////////////////////////////
/////////////this is scott's code
///////////////////////////////////////



$('.onLoggedIn form').submit(function () {
  var url = $('.onLoggedIn input[type="url"]').val();
  console.log(url);
  var uid = fb.getAuth().uid;
  var token = fb.getAuth().token;
  //var postUrl = `${FIREBASE_URL}users/${uid}/movies.json?auth=${token}`;//doesn't like babel yet
  var postUrl = FIREBASE_URL + 'users/' + uid + '/movies.json?auth=$token';
  $.post(postUrl, JSON.stringify(url), function (res) {
    console.log(url);
    console.log(token);
    console.log(postUrl);
    console.log(uid);
    addMoviesToDom({
      url: url
    });
    clearForms();
    // res = { name: '-Jk4dfDd123' }
  });
  event.preventDefault();
})

fb.onAuth(function (authData) {
  if (initLoad) {
    var onLoggedOut = $('.onLoggedOut');
    var onLoggedIn = $('.onLoggedIn');
    var onTempPassword = $('.onTempPassword');

    if (authData && authData.password.isTemporaryPassword) {
      // temporary log in
      onTempPassword.removeClass('hidden');
      onLoggedIn.addClass('hidden');
      onLoggedOut.addClass('hidden');
    } else if (authData) {
      // logged in
      onLoggedIn.removeClass('hidden');
      onLoggedOut.addClass('hidden');
      onTempPassword.addClass('hidden');
      $('.onLoggedIn h1').text(`Hello ${authData.password.email}`);

      movies = fb.child(`users/${fb.getAuth().uid}/movies`);
      movies.on('child_added', function (snapshot) {
        var obj = {};
        obj[snapshot.key()] = snapshot.val();
        addMoviesToDom(obj);
      });

    } else {
      // on logged out
      onLoggedOut.removeClass('hidden');
      onLoggedIn.addClass('hidden');
      onTempPassword.addClass('hidden');
    }
  }

  initLoad = false;
});

function getUserData(cb) {
  var uid = fb.getAuth().uid;
  var token = fb.getAuth().token;
  var getUrl = `${FIREBASE_URL}/users/${uid}/movies.json?auth=${token}`;
  $.get(getUrl, cb);
}
function addMoviesToDom(movies) {
  if (movies) {
    Object.keys(movies).forEach(function (uuid) {
      $(`<img src="${movies[uuid]}" data-uid="${uuid}">`).appendTo($('.favMovies'));
    })
  }
}

$('.onTempPassword form').submit(function () {
  var email = fb.getAuth().password.email;
  var oldPw = $('.onTempPassword input:nth-child(1)').val();
  var newPw = $('.onTempPassword input:nth-child(2)').val();
  fb.changePassword({
    email: email,
    oldPassword: oldPw,
    newPassword: newPw
  }, function (err) {
    if (err) {
      alert(err.toString());
    } else {
      fb.unauth();
    }
  });
  event.preventDefault();
})
$('.doResetPassword').click(function () {
  var email = $('.onLoggedOut input[type="email"]').val();
  fb.resetPassword({
    email: email
  }, function (err) {
    if (err) {
      alert(err.toString());
    } else {
      alert('Check your email!');
    }
  });
});
$('.doLogout').click(function () {
  fb.unauth(function () {
    window.location.reload();
  });
})
$(".goToMovies").click(function () {
  window.location = "movies.html";
});
$('.doRegister').click(function () {
  var email = $('.onLoggedOut input[type="email"]').val();
  var password = $('.onLoggedOut input[type="password"]').val();
  fb.createUser({
    email: email,
    password: password
  }, function (err, userData) {
    if (err) {
      alert(err.toString());
    } else {
      clearForms();
      doLogin(email, password, function () {
        window.location.reload();
      });
    }
  });
  event.preventDefault();
});
$('.onLoggedOut form').submit(function () {
  var email = $('.onLoggedOut input[type="email"]').val();
  var password = $('.onLoggedOut input[type="password"]').val();
  doLogin(email, password, function () {
    window.location.reload();
  });
  event.preventDefault();
});
function clearForms() {
  $('input[type="text"], input[type="email"], input[type="password"], input[type="url"]').val('');
}
function saveAuthData(authData) {
  $.ajax({
    method: 'PUT',
    url: `${FIREBASE_URL}users/${authData.uid}/profile.json?auth=${authData.token}`,
    data: JSON.stringify(authData)
  });
}
function doLogin(email, password, cb) {
  fb.authWithPassword({
    email: email,
    password: password
  }, function (err, authData) {
    if (err) {
      alert(err.toString());
    } else {
      saveAuthData(authData);
      typeof cb === 'function' && cb(authData);
    }
  });
}
function getUserData(cb) {
  var uid = fb.getAuth().uid;
  var token = fb.getAuth().token;
  var getUrl = `${FIREBASE_URL}/users/${uid}/movies.json?auth=${token}`;
  $.get(getUrl, cb);
}
function addMoviesToDom(movies) {
  if (movies) {
    Object.keys(movies).forEach(function (uuid) {
      $(`<img src="${movies[uuid]}" data-uid="${uuid}">`).appendTo($('.favMovies'));
    })
  }
}


////////////////////////////////////////////////////
////////////  MOVIE APP CODE  //////////////////////
////////////////////////////////////////////////////

//function to get firebase data and add to table on page load
$.get(FIREBASE_URL, function(data){
  console.log(data);
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
/*
//saves the authData
function saveAuthData (authData) {
  $.ajax({
    method: 'PUT',
    url: `${FIREBASE_URL}users/${authData.uid}/profile.json?auth=${authData.token}`,
    data: JSON.stringify(authData)
  });
}
*/

//posts movie object to firebase and calls addTableDetail()
$movieDetails.on('click', '.add-movie', function() {
  //note: must be in this format because the .add-movie button is dynamically created
  var movie = $searchBar.value;
  var url = omdb_URL + "t=" + movie + "&r=json";
  console.log(url);

  var ref = FIREBASE_URL + 'users/' + authData.uid + '/movies.json';

  $.get(url, function (data) {
    $.post(ref, JSON.stringify(data), function(res){
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
  });console.log(deleteURL);
});

