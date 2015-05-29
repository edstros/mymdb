var FIREBASE_URL = 'https://eamdb.firebaseio.com/';
var fb = new Firebase(FIREBASE_URL);
var movies; // instantiates a var for appending children to the dom
var omdb_URL = 'http://www.omdbapi.com/?';
var $searchForm = $('.search-form');
var $searchBar = $('input[name=search]')[0];
var $movieDetails = $(".movie-details");
var $table = $("table");
var initLoad = true;
var authData = fb.getAuth();
var initLoad = true;
$('.onLoggedIn form').submit(function () { //when logged in, this is the form where users can write the urls to their photos
  var url = $('.onLoggedIn input[type="url"]').val(); //this is the text box where people can insert their urls
  movies.push(url, function (err) { //posts the photo to firebase
    console.log(err);
  })
  event.preventDefault();
});
$('.onTempPassword form').submit(function () { //function for getting a temporary password
  var email = fb.getAuth().password.email; //making sure the email address exists
  var oldPw = $('.onTempPassword input:nth-child(1)').val(); //the temporary password
  var newPw = $('.onTempPassword input:nth-child(2)').val(); //the new user-generated password
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
});
//resetting a password
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
$(".goToMovies").click(function () {
  window.location = "movies.html";
});
$('.doLogout').click(function () {
    fb.unauth(function () {
      // window.location.reload();
      window.location.href = window.location.href;
    });
  })
  //registering a new user
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
        window.location.href = window.location.href;
      });
    }
  });
  event.preventDefault();
});
//if logged out, this form comes up and can log users in
$('.onLoggedOut form').submit(function () {
  var email = $('.onLoggedOut input[type="email"]').val();
  var password = $('.onLoggedOut input[type="password"]').val();
  doLogin(email, password, function () {
    // window.location.reload();
    window.location.href = window.location.href;
  });
  event.preventDefault();
});
//this function inserts empty strings into forms upon being called
function clearForms() {
  $('input[type="text"], input[type="url"]').val('');
}
function saveAuthData(authData) { //gives you the authData object to work with
  var ref = fb.child(`users/${authData.uid}/profile`);
  ref.set(authData);
  console.log(authData);
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
      }console.log(authData);
    });
  }
  /*
  ***********************************
  *********** FROM HERE
  ***********************************
  function addMovieToDom (photo) {
    if (photo) {
      var uuid = Object.keys(photo)[0];
      $(`<img src="${photo[uuid]}" data-uid="${uuid}">`).appendTo($('.favFotos'));
    }
  }*/


//function to get firebase data and add to table on page load
//$.get(FIREBASE_URL, function (data) {
$.get(authData, function (data) {
  console.log(authData);
  if (data === null) {
    $table.hide(); //hides table if firebase is empty
  } else {
    Object.keys(data).forEach(function (id) {
      addTableDetail(data[id], id);
    });
    console.log(data) /////////////////////////////////////THIS DOES NOT WORK
  }
});
//function to retrieve movie JSON file and add to html //// THIS WORKS
$searchForm.on('submit', function () {
  var movie = $searchBar.value;
  var url = omdb_URL + "t=" + movie + "&r=json";
  console.log(url);//  THIS WORKED
  $.get(url, function (data) {
    addMovieDetail(data);
  });
  return false;
});
//function to add JSON data to html //// THIS WORKS
function addMovieDetail(data) {
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
$movieDetails.on('click', '.add-movie', function () {
  //note: must be in this format because the .add-movie button is dynamically created
  var movie = $searchBar.value;
  var url = omdb_URL + "t=" + movie + "&r=json";
  var token = fb.getAuth().token;
  console.log(url); //  this worked
  var ref = FIREBASE_URL + 'users/' + authData.uid + '/movies.json?auth=' + authData.token;
  console.log(ref); //  works
  $.get(url, function (data) {
    $.post(ref, JSON.stringify(data), function (res) {
      addTableDetail(data, res.name);
      console.log(addTableDetail);///////// This works. Holy fuck.
    });
  }, 'jsonp');
});
//function to append a row to the table
function addTableDetail(data, id) {
  $table.show();
  $table.append("<tr class='hide-rows'></tr>");
  var $target = $("tr:last");
  console.log('did this show up?') //does not fucking work
  $target.attr("data-id", id);
  var poster = data.Poster === "N/A" ? "http://i.imgur.com/rXuQiCm.jpg?1" : data.Poster;
  $target.append("<td class=\"poster\"><img src=" + poster + "></img></td>");
  $target.append("<td class=\"title\">" + data.Title + "</td>");
  $target.append("<td class=\"year\">" + data.Year + "</td>");
  $target.append("<td class=\"rating\">" + data.imdbRating + "</td>");
  $target.append("<td><button class='btn btn-default btn-xs'>" + "&nbsp;X&nbsp;" + "</button></td>");
}
//deletes row from table and firebase
$table.on('click', 'button', function () {
  var $movie = $(this).closest('tr');
  var $id = $movie.attr('data-id');
  $movie.remove();
  console.log('can you see me?');// THIS WORKS
  var deleteURL = FIREBASE_URL.slice(0, -5) + '/' + $id + '.json';
  $.ajax({
    url: deleteURL,
    type: 'DELETE'
  });
  console.log(deleteURL);// THIS WORKS
});
/***********************************
 *********** TO HERE
 ************************************
 */
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
        addMovieToDom(obj);
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
