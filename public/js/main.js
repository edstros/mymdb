/*jshint unused: true, node: true */
/*jslint unparam: true, node: true */
/*jshint -W117 */ /*jshint -W098 */

'use strict';

var omdb_URL = 'http://www.omdbapi.com/?';
var $searchForm = $('.search-form');
var $searchBar = $('input[name=search]')[0];
var FIREBASE_URL = 'https://eamdb.firebaseio.com/';
var fb = new Firebase(FIREBASE_URL);
var movies;
var $movieDetails = $('.movie-details');
var $table = $('table');
var initLoad = true;
var authData = fb.getAuth();

console.log(authData);

///////////////////////////////////////
/////////////this is scott's code
///////////////////////////////////////

$('.onLoggedIn form').submit(function () {
  var url = $('.onLoggedIn input[type="url"]').val();

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
});

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
      $('.onLoggedIn h1').text('Hello ' + authData.password.email);

      movies = fb.child('users/' + fb.getAuth().uid + '/movies');
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
  var getUrl = '' + FIREBASE_URL + '/users/' + uid + '/movies.json?auth=' + token;
  $.get(getUrl, cb);
}
function addMoviesToDom(movies) {
  if (movies) {
    Object.keys(movies).forEach(function (uuid) {
      $('<img src="' + movies[uuid] + '" data-uid="' + uuid + '">').appendTo($('.favMovies'));
    });
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
});
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
});
$('.goToMovies').click(function () {
  window.location = 'movies.html';
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
    url: '' + FIREBASE_URL + 'users/' + authData.uid + '/profile.json?auth=' + authData.token,
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
  var getUrl = '' + FIREBASE_URL + '/users/' + uid + '/movies.json?auth=' + token;
  $.get(getUrl, cb);
}
function addMoviesToDom(movies) {
  if (movies) {
    Object.keys(movies).forEach(function (uuid) {
      $('<img src="' + movies[uuid] + '" data-uid="' + uuid + '">').appendTo($('.favMovies'));
    });
  }
}

////////////////////////////////////////////////////
////////////  MOVIE APP CODE  //////////////////////
////////////////////////////////////////////////////

//function to get firebase data and add to table on page load
$.get(FIREBASE_URL, function (data) {
  console.log(data);
  if (data === null) {
    $table.hide(); //hides table if firebase is empty
  } else {
    Object.keys(data).forEach(function (id) {
      addTableDetail(data[id], id);
    });
  }
});
//function to retrieve movie JSON file and add to html
$searchForm.on('submit', function () {
  var movie = $searchBar.value;
  var url = omdb_URL + 't=' + movie + '&r=json';
  console.log(url);
  $.get(url, function (data) {
    addMovieDetail(data);
  });
  return false;
});

//function to add JSON data to html
function addMovieDetail(data) {
  var $target = $('.movie-details');

  if (data.Title === undefined) {
    $target.empty();
    $target.append('<h2>Sorry, never heard of it!</h2>');
  } else {
    var poster = data.Poster === 'N/A' ? 'http://i.imgur.com/rXuQiCm.jpg?1' : data.Poster;
    $target.empty();
    $target.append('<img src=' + poster + '></img>');
    $target.append('<h1>' + data.Title + '</h1>');
    $target.append('<h2> Year: ' + data.Year + '</h2>');
    $target.append('<h2> IMDB Rating: ' + data.imdbRating + '</h2>');

    $target.append('<button class=\'btn btn-default btn-xs add-movie\'>Add Movie</button>');
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
$movieDetails.on('click', '.add-movie', function () {
  //note: must be in this format because the .add-movie button is dynamically created
  var movie = $searchBar.value;
  var url = omdb_URL + 't=' + movie + '&r=json';
  console.log(url);

  var ref = FIREBASE_URL + 'users/' + authData.uid + '/movies.json';

  $.get(url, function (data) {
    $.post(ref, JSON.stringify(data), function (res) {
      addTableDetail(data, res.name);
    });
  }, 'jsonp');
});

//function to append a row to the table
function addTableDetail(data, id) {
  $table.show();
  $table.append('<tr class=\'hide-rows\'></tr>');
  var $target = $('tr:last');
  $target.attr('data-id', id);
  var poster = data.Poster === 'N/A' ? 'http://i.imgur.com/rXuQiCm.jpg?1' : data.Poster;
  $target.append('<td class="poster"><img src=' + poster + '></img></td>');
  $target.append('<td class="title">' + data.Title + '</td>');
  $target.append('<td class="year">' + data.Year + '</td>');
  $target.append('<td class="rating">' + data.imdbRating + '</td>');
  $target.append('<td><button class=\'btn btn-default btn-xs\'>' + '&nbsp;X&nbsp;' + '</button></td>');
}

//deletes row from table and firebase
$table.on('click', 'button', function () {
  var $movie = $(this).closest('tr');
  var $id = $movie.attr('data-id');
  $movie.remove();
  var deleteURL = FIREBASE_URL.slice(0, -5) + '/' + $id + '.json';
  $.ajax({
    url: deleteURL,
    type: 'DELETE'
  });console.log(deleteURL);
});
//# sourceMappingURL=data:application/json;base64,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QUUsT0FBTyxDQUFDLENBQUM7QUFDNUQsU0FBTyxDQUFDLE1BQU0sQ0FBQyxtQkFBcUIsR0FBRSxJQUFJLENBQUMsSUFBSSxHQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQzFELFNBQU8sQ0FBQyxNQUFNLENBQUMscUJBQXVCLEdBQUUsSUFBSSxDQUFDLFVBQVUsR0FBRSxPQUFPLENBQUMsQ0FBQztBQUNsRSxTQUFPLENBQUMsTUFBTSxDQUFDLCtDQUE2QyxHQUFFLGVBQWUsR0FBRSxnQkFBZ0IsQ0FBQyxDQUFDO0NBQ2xHOzs7QUFJRCxNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsWUFBVTtBQUNyQyxNQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ25DLE1BQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDakMsUUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ2hCLE1BQUksU0FBUyxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxPQUFPLENBQUM7QUFDaEUsR0FBQyxDQUFDLElBQUksQ0FBQztBQUNQLE9BQUcsRUFBRSxTQUFTO0FBQ2QsUUFBSSxFQUFFLFFBQVE7R0FDYixDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztDQUMzQixDQUFDLENBQUMiLCJmaWxlIjoic3JjL2pzL21haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKmpzaGludCB1bnVzZWQ6IHRydWUsIG5vZGU6IHRydWUgKi9cbi8qanNsaW50IHVucGFyYW06IHRydWUsIG5vZGU6IHRydWUgKi9cbi8qanNoaW50IC1XMTE3ICovIC8qanNoaW50IC1XMDk4ICovXG5cbnZhciBvbWRiX1VSTCA9ICdodHRwOi8vd3d3Lm9tZGJhcGkuY29tLz8nO1xudmFyICRzZWFyY2hGb3JtID0gJCgnLnNlYXJjaC1mb3JtJyk7XG52YXIgJHNlYXJjaEJhciA9ICQoJ2lucHV0W25hbWU9c2VhcmNoXScpWzBdO1xudmFyIEZJUkVCQVNFX1VSTCA9IFwiaHR0cHM6Ly9lYW1kYi5maXJlYmFzZWlvLmNvbS9cIjtcbnZhciBmYiA9IG5ldyBGaXJlYmFzZShGSVJFQkFTRV9VUkwpO1xudmFyIG1vdmllcztcbnZhciAkbW92aWVEZXRhaWxzID0gJChcIi5tb3ZpZS1kZXRhaWxzXCIpO1xudmFyICR0YWJsZSA9ICQoXCJ0YWJsZVwiKTtcbnZhciBpbml0TG9hZCA9IHRydWU7XG52YXIgYXV0aERhdGEgPSBmYi5nZXRBdXRoKCk7XG5cbmNvbnNvbGUubG9nKGF1dGhEYXRhKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy90aGlzIGlzIHNjb3R0J3MgY29kZVxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblxuXG4kKCcub25Mb2dnZWRJbiBmb3JtJykuc3VibWl0KGZ1bmN0aW9uICgpIHtcbiAgdmFyIHVybCA9ICQoJy5vbkxvZ2dlZEluIGlucHV0W3R5cGU9XCJ1cmxcIl0nKS52YWwoKTtcblxuICB2YXIgdWlkID0gZmIuZ2V0QXV0aCgpLnVpZDtcbiAgdmFyIHRva2VuID0gZmIuZ2V0QXV0aCgpLnRva2VuO1xuICAvL3ZhciBwb3N0VXJsID0gYCR7RklSRUJBU0VfVVJMfXVzZXJzLyR7dWlkfS9tb3ZpZXMuanNvbj9hdXRoPSR7dG9rZW59YDsvL2RvZXNuJ3QgbGlrZSBiYWJlbCB5ZXRcbiAgdmFyIHBvc3RVcmwgPSBGSVJFQkFTRV9VUkwgKyAndXNlcnMvJyArIHVpZCArICcvbW92aWVzLmpzb24/YXV0aD0kdG9rZW4nO1xuICAkLnBvc3QocG9zdFVybCwgSlNPTi5zdHJpbmdpZnkodXJsKSwgZnVuY3Rpb24gKHJlcykge1xuICAgIGNvbnNvbGUubG9nKHVybCk7XG4gICAgY29uc29sZS5sb2codG9rZW4pO1xuICAgIGNvbnNvbGUubG9nKHBvc3RVcmwpO1xuICAgIGNvbnNvbGUubG9nKHVpZCk7XG4gICAgYWRkTW92aWVzVG9Eb20oe1xuICAgICAgdXJsOiB1cmxcbiAgICB9KTtcbiAgICBjbGVhckZvcm1zKCk7XG4gICAgLy8gcmVzID0geyBuYW1lOiAnLUprNGRmRGQxMjMnIH1cbiAgfSk7XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG59KVxuXG5mYi5vbkF1dGgoZnVuY3Rpb24gKGF1dGhEYXRhKSB7XG4gIGlmIChpbml0TG9hZCkge1xuICAgIHZhciBvbkxvZ2dlZE91dCA9ICQoJy5vbkxvZ2dlZE91dCcpO1xuICAgIHZhciBvbkxvZ2dlZEluID0gJCgnLm9uTG9nZ2VkSW4nKTtcbiAgICB2YXIgb25UZW1wUGFzc3dvcmQgPSAkKCcub25UZW1wUGFzc3dvcmQnKTtcblxuICAgIGlmIChhdXRoRGF0YSAmJiBhdXRoRGF0YS5wYXNzd29yZC5pc1RlbXBvcmFyeVBhc3N3b3JkKSB7XG4gICAgICAvLyB0ZW1wb3JhcnkgbG9nIGluXG4gICAgICBvblRlbXBQYXNzd29yZC5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgICBvbkxvZ2dlZEluLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAgIG9uTG9nZ2VkT3V0LmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICB9IGVsc2UgaWYgKGF1dGhEYXRhKSB7XG4gICAgICAvLyBsb2dnZWQgaW5cbiAgICAgIG9uTG9nZ2VkSW4ucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgb25Mb2dnZWRPdXQuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgb25UZW1wUGFzc3dvcmQuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgJCgnLm9uTG9nZ2VkSW4gaDEnKS50ZXh0KGBIZWxsbyAke2F1dGhEYXRhLnBhc3N3b3JkLmVtYWlsfWApO1xuXG4gICAgICBtb3ZpZXMgPSBmYi5jaGlsZChgdXNlcnMvJHtmYi5nZXRBdXRoKCkudWlkfS9tb3ZpZXNgKTtcbiAgICAgIG1vdmllcy5vbignY2hpbGRfYWRkZWQnLCBmdW5jdGlvbiAoc25hcHNob3QpIHtcbiAgICAgICAgdmFyIG9iaiA9IHt9O1xuICAgICAgICBvYmpbc25hcHNob3Qua2V5KCldID0gc25hcHNob3QudmFsKCk7XG4gICAgICAgIGFkZE1vdmllc1RvRG9tKG9iaik7XG4gICAgICB9KTtcblxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBvbiBsb2dnZWQgb3V0XG4gICAgICBvbkxvZ2dlZE91dC5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgICBvbkxvZ2dlZEluLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAgIG9uVGVtcFBhc3N3b3JkLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICB9XG4gIH1cblxuICBpbml0TG9hZCA9IGZhbHNlO1xufSk7XG5cbmZ1bmN0aW9uIGdldFVzZXJEYXRhKGNiKSB7XG4gIHZhciB1aWQgPSBmYi5nZXRBdXRoKCkudWlkO1xuICB2YXIgdG9rZW4gPSBmYi5nZXRBdXRoKCkudG9rZW47XG4gIHZhciBnZXRVcmwgPSBgJHtGSVJFQkFTRV9VUkx9L3VzZXJzLyR7dWlkfS9tb3ZpZXMuanNvbj9hdXRoPSR7dG9rZW59YDtcbiAgJC5nZXQoZ2V0VXJsLCBjYik7XG59XG5mdW5jdGlvbiBhZGRNb3ZpZXNUb0RvbShtb3ZpZXMpIHtcbiAgaWYgKG1vdmllcykge1xuICAgIE9iamVjdC5rZXlzKG1vdmllcykuZm9yRWFjaChmdW5jdGlvbiAodXVpZCkge1xuICAgICAgJChgPGltZyBzcmM9XCIke21vdmllc1t1dWlkXX1cIiBkYXRhLXVpZD1cIiR7dXVpZH1cIj5gKS5hcHBlbmRUbygkKCcuZmF2TW92aWVzJykpO1xuICAgIH0pXG4gIH1cbn1cblxuJCgnLm9uVGVtcFBhc3N3b3JkIGZvcm0nKS5zdWJtaXQoZnVuY3Rpb24gKCkge1xuICB2YXIgZW1haWwgPSBmYi5nZXRBdXRoKCkucGFzc3dvcmQuZW1haWw7XG4gIHZhciBvbGRQdyA9ICQoJy5vblRlbXBQYXNzd29yZCBpbnB1dDpudGgtY2hpbGQoMSknKS52YWwoKTtcbiAgdmFyIG5ld1B3ID0gJCgnLm9uVGVtcFBhc3N3b3JkIGlucHV0Om50aC1jaGlsZCgyKScpLnZhbCgpO1xuICBmYi5jaGFuZ2VQYXNzd29yZCh7XG4gICAgZW1haWw6IGVtYWlsLFxuICAgIG9sZFBhc3N3b3JkOiBvbGRQdyxcbiAgICBuZXdQYXNzd29yZDogbmV3UHdcbiAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGFsZXJ0KGVyci50b1N0cmluZygpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZmIudW5hdXRoKCk7XG4gICAgfVxuICB9KTtcbiAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbn0pXG4kKCcuZG9SZXNldFBhc3N3b3JkJykuY2xpY2soZnVuY3Rpb24gKCkge1xuICB2YXIgZW1haWwgPSAkKCcub25Mb2dnZWRPdXQgaW5wdXRbdHlwZT1cImVtYWlsXCJdJykudmFsKCk7XG4gIGZiLnJlc2V0UGFzc3dvcmQoe1xuICAgIGVtYWlsOiBlbWFpbFxuICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgaWYgKGVycikge1xuICAgICAgYWxlcnQoZXJyLnRvU3RyaW5nKCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhbGVydCgnQ2hlY2sgeW91ciBlbWFpbCEnKTtcbiAgICB9XG4gIH0pO1xufSk7XG4kKCcuZG9Mb2dvdXQnKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gIGZiLnVuYXV0aChmdW5jdGlvbiAoKSB7XG4gICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICB9KTtcbn0pXG4kKFwiLmdvVG9Nb3ZpZXNcIikuY2xpY2soZnVuY3Rpb24gKCkge1xuICB3aW5kb3cubG9jYXRpb24gPSBcIm1vdmllcy5odG1sXCI7XG59KTtcbiQoJy5kb1JlZ2lzdGVyJykuY2xpY2soZnVuY3Rpb24gKCkge1xuICB2YXIgZW1haWwgPSAkKCcub25Mb2dnZWRPdXQgaW5wdXRbdHlwZT1cImVtYWlsXCJdJykudmFsKCk7XG4gIHZhciBwYXNzd29yZCA9ICQoJy5vbkxvZ2dlZE91dCBpbnB1dFt0eXBlPVwicGFzc3dvcmRcIl0nKS52YWwoKTtcbiAgZmIuY3JlYXRlVXNlcih7XG4gICAgZW1haWw6IGVtYWlsLFxuICAgIHBhc3N3b3JkOiBwYXNzd29yZFxuICB9LCBmdW5jdGlvbiAoZXJyLCB1c2VyRGF0YSkge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGFsZXJ0KGVyci50b1N0cmluZygpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2xlYXJGb3JtcygpO1xuICAgICAgZG9Mb2dpbihlbWFpbCwgcGFzc3dvcmQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcbiAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbn0pO1xuJCgnLm9uTG9nZ2VkT3V0IGZvcm0nKS5zdWJtaXQoZnVuY3Rpb24gKCkge1xuICB2YXIgZW1haWwgPSAkKCcub25Mb2dnZWRPdXQgaW5wdXRbdHlwZT1cImVtYWlsXCJdJykudmFsKCk7XG4gIHZhciBwYXNzd29yZCA9ICQoJy5vbkxvZ2dlZE91dCBpbnB1dFt0eXBlPVwicGFzc3dvcmRcIl0nKS52YWwoKTtcbiAgZG9Mb2dpbihlbWFpbCwgcGFzc3dvcmQsIGZ1bmN0aW9uICgpIHtcbiAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gIH0pO1xuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xufSk7XG5mdW5jdGlvbiBjbGVhckZvcm1zKCkge1xuICAkKCdpbnB1dFt0eXBlPVwidGV4dFwiXSwgaW5wdXRbdHlwZT1cImVtYWlsXCJdLCBpbnB1dFt0eXBlPVwicGFzc3dvcmRcIl0sIGlucHV0W3R5cGU9XCJ1cmxcIl0nKS52YWwoJycpO1xufVxuZnVuY3Rpb24gc2F2ZUF1dGhEYXRhKGF1dGhEYXRhKSB7XG4gICQuYWpheCh7XG4gICAgbWV0aG9kOiAnUFVUJyxcbiAgICB1cmw6IGAke0ZJUkVCQVNFX1VSTH11c2Vycy8ke2F1dGhEYXRhLnVpZH0vcHJvZmlsZS5qc29uP2F1dGg9JHthdXRoRGF0YS50b2tlbn1gLFxuICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KGF1dGhEYXRhKVxuICB9KTtcbn1cbmZ1bmN0aW9uIGRvTG9naW4oZW1haWwsIHBhc3N3b3JkLCBjYikge1xuICBmYi5hdXRoV2l0aFBhc3N3b3JkKHtcbiAgICBlbWFpbDogZW1haWwsXG4gICAgcGFzc3dvcmQ6IHBhc3N3b3JkXG4gIH0sIGZ1bmN0aW9uIChlcnIsIGF1dGhEYXRhKSB7XG4gICAgaWYgKGVycikge1xuICAgICAgYWxlcnQoZXJyLnRvU3RyaW5nKCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzYXZlQXV0aERhdGEoYXV0aERhdGEpO1xuICAgICAgdHlwZW9mIGNiID09PSAnZnVuY3Rpb24nICYmIGNiKGF1dGhEYXRhKTtcbiAgICB9XG4gIH0pO1xufVxuZnVuY3Rpb24gZ2V0VXNlckRhdGEoY2IpIHtcbiAgdmFyIHVpZCA9IGZiLmdldEF1dGgoKS51aWQ7XG4gIHZhciB0b2tlbiA9IGZiLmdldEF1dGgoKS50b2tlbjtcbiAgdmFyIGdldFVybCA9IGAke0ZJUkVCQVNFX1VSTH0vdXNlcnMvJHt1aWR9L21vdmllcy5qc29uP2F1dGg9JHt0b2tlbn1gO1xuICAkLmdldChnZXRVcmwsIGNiKTtcbn1cbmZ1bmN0aW9uIGFkZE1vdmllc1RvRG9tKG1vdmllcykge1xuICBpZiAobW92aWVzKSB7XG4gICAgT2JqZWN0LmtleXMobW92aWVzKS5mb3JFYWNoKGZ1bmN0aW9uICh1dWlkKSB7XG4gICAgICAkKGA8aW1nIHNyYz1cIiR7bW92aWVzW3V1aWRdfVwiIGRhdGEtdWlkPVwiJHt1dWlkfVwiPmApLmFwcGVuZFRvKCQoJy5mYXZNb3ZpZXMnKSk7XG4gICAgfSlcbiAgfVxufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLyAgTU9WSUUgQVBQIENPREUgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLy9mdW5jdGlvbiB0byBnZXQgZmlyZWJhc2UgZGF0YSBhbmQgYWRkIHRvIHRhYmxlIG9uIHBhZ2UgbG9hZFxuJC5nZXQoRklSRUJBU0VfVVJMLCBmdW5jdGlvbihkYXRhKXtcbiAgY29uc29sZS5sb2coZGF0YSk7XG4gIGlmIChkYXRhPT09bnVsbCl7XG4gICAgJHRhYmxlLmhpZGUoKTsgLy9oaWRlcyB0YWJsZSBpZiBmaXJlYmFzZSBpcyBlbXB0eVxuICB9ZWxzZXtcbiAgICBPYmplY3Qua2V5cyhkYXRhKS5mb3JFYWNoKGZ1bmN0aW9uKGlkKXtcbiAgICAgIGFkZFRhYmxlRGV0YWlsKGRhdGFbaWRdLCBpZCk7XG4gICAgfSk7XG4gIH1cbn0pO1xuLy9mdW5jdGlvbiB0byByZXRyaWV2ZSBtb3ZpZSBKU09OIGZpbGUgYW5kIGFkZCB0byBodG1sXG4kc2VhcmNoRm9ybS5vbignc3VibWl0JywgZnVuY3Rpb24oKXtcbiAgdmFyIG1vdmllID0gJHNlYXJjaEJhci52YWx1ZTtcbiAgdmFyIHVybCA9IG9tZGJfVVJMICsgXCJ0PVwiICsgbW92aWUgKyBcIiZyPWpzb25cIjtcbiAgY29uc29sZS5sb2codXJsKTtcbiAgJC5nZXQodXJsLCBmdW5jdGlvbihkYXRhKXtcbiAgICBhZGRNb3ZpZURldGFpbChkYXRhKTtcbiAgfSk7XG4gIHJldHVybiBmYWxzZTtcbn0pO1xuXG5cbi8vZnVuY3Rpb24gdG8gYWRkIEpTT04gZGF0YSB0byBodG1sXG5mdW5jdGlvbiBhZGRNb3ZpZURldGFpbChkYXRhKXtcbiAgdmFyICR0YXJnZXQgPSAkKFwiLm1vdmllLWRldGFpbHNcIik7XG5cbiAgaWYgKGRhdGEuVGl0bGUgPT09IHVuZGVmaW5lZCkge1xuICAgICR0YXJnZXQuZW1wdHkoKTtcbiAgICAkdGFyZ2V0LmFwcGVuZChcIjxoMj5Tb3JyeSwgbmV2ZXIgaGVhcmQgb2YgaXQhPC9oMj5cIik7XG4gIH0gZWxzZSB7XG4gICAgdmFyIHBvc3RlciA9IGRhdGEuUG9zdGVyID09PSBcIk4vQVwiID8gXCJodHRwOi8vaS5pbWd1ci5jb20vclh1UWlDbS5qcGc/MVwiIDogZGF0YS5Qb3N0ZXI7XG4gICAgJHRhcmdldC5lbXB0eSgpO1xuICAgICR0YXJnZXQuYXBwZW5kKFwiPGltZyBzcmM9XCIgKyBwb3N0ZXIgKyBcIj48L2ltZz5cIik7XG4gICAgJHRhcmdldC5hcHBlbmQoXCI8aDE+XCIgKyBkYXRhLlRpdGxlICsgXCI8L2gxPlwiKTtcbiAgICAkdGFyZ2V0LmFwcGVuZChcIjxoMj4gWWVhcjogXCIgKyBkYXRhLlllYXIgKyBcIjwvaDI+XCIpO1xuICAgICR0YXJnZXQuYXBwZW5kKFwiPGgyPiBJTURCIFJhdGluZzogXCIgKyBkYXRhLmltZGJSYXRpbmcgKyBcIjwvaDI+XCIpO1xuXG4gICAgJHRhcmdldC5hcHBlbmQoXCI8YnV0dG9uIGNsYXNzPSdidG4gYnRuLWRlZmF1bHQgYnRuLXhzIGFkZC1tb3ZpZSc+QWRkIE1vdmllPC9idXR0b24+XCIpO1xuICAgIH1cbn1cbi8qXG4vL3NhdmVzIHRoZSBhdXRoRGF0YVxuZnVuY3Rpb24gc2F2ZUF1dGhEYXRhIChhdXRoRGF0YSkge1xuICAkLmFqYXgoe1xuICAgIG1ldGhvZDogJ1BVVCcsXG4gICAgdXJsOiBgJHtGSVJFQkFTRV9VUkx9dXNlcnMvJHthdXRoRGF0YS51aWR9L3Byb2ZpbGUuanNvbj9hdXRoPSR7YXV0aERhdGEudG9rZW59YCxcbiAgICBkYXRhOiBKU09OLnN0cmluZ2lmeShhdXRoRGF0YSlcbiAgfSk7XG59XG4qL1xuXG4vL3Bvc3RzIG1vdmllIG9iamVjdCB0byBmaXJlYmFzZSBhbmQgY2FsbHMgYWRkVGFibGVEZXRhaWwoKVxuJG1vdmllRGV0YWlscy5vbignY2xpY2snLCAnLmFkZC1tb3ZpZScsIGZ1bmN0aW9uKCkge1xuICAvL25vdGU6IG11c3QgYmUgaW4gdGhpcyBmb3JtYXQgYmVjYXVzZSB0aGUgLmFkZC1tb3ZpZSBidXR0b24gaXMgZHluYW1pY2FsbHkgY3JlYXRlZFxuICB2YXIgbW92aWUgPSAkc2VhcmNoQmFyLnZhbHVlO1xuICB2YXIgdXJsID0gb21kYl9VUkwgKyBcInQ9XCIgKyBtb3ZpZSArIFwiJnI9anNvblwiO1xuICBjb25zb2xlLmxvZyh1cmwpO1xuXG4gIHZhciByZWYgPSBGSVJFQkFTRV9VUkwgKyAndXNlcnMvJyArIGF1dGhEYXRhLnVpZCArICcvbW92aWVzLmpzb24nO1xuXG4gICQuZ2V0KHVybCwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAkLnBvc3QocmVmLCBKU09OLnN0cmluZ2lmeShkYXRhKSwgZnVuY3Rpb24ocmVzKXtcbiAgICAgIGFkZFRhYmxlRGV0YWlsKGRhdGEsIHJlcy5uYW1lKTtcbiAgICAgIH0pO1xuICAgIH0sICdqc29ucCcpO1xuIH0pO1xuXG4vL2Z1bmN0aW9uIHRvIGFwcGVuZCBhIHJvdyB0byB0aGUgdGFibGVcbmZ1bmN0aW9uIGFkZFRhYmxlRGV0YWlsKGRhdGEsIGlkKXtcbiAgJHRhYmxlLnNob3coKTtcbiAgJHRhYmxlLmFwcGVuZChcIjx0ciBjbGFzcz0naGlkZS1yb3dzJz48L3RyPlwiKTtcbiAgdmFyICR0YXJnZXQgPSAkKFwidHI6bGFzdFwiKTtcbiAgJHRhcmdldC5hdHRyKFwiZGF0YS1pZFwiLCBpZCk7XG4gIHZhciBwb3N0ZXIgPSBkYXRhLlBvc3RlciA9PT0gXCJOL0FcIiA/IFwiaHR0cDovL2kuaW1ndXIuY29tL3JYdVFpQ20uanBnPzFcIiA6IGRhdGEuUG9zdGVyO1xuICAkdGFyZ2V0LmFwcGVuZChcIjx0ZCBjbGFzcz1cXFwicG9zdGVyXFxcIj48aW1nIHNyYz1cIiArIHBvc3RlciArIFwiPjwvaW1nPjwvdGQ+XCIpO1xuICAkdGFyZ2V0LmFwcGVuZChcIjx0ZCBjbGFzcz1cXFwidGl0bGVcXFwiPlwiKyBkYXRhLlRpdGxlICtcIjwvdGQ+XCIpO1xuICAkdGFyZ2V0LmFwcGVuZChcIjx0ZCBjbGFzcz1cXFwieWVhclxcXCI+XCIrIGRhdGEuWWVhciArXCI8L3RkPlwiKTtcbiAgJHRhcmdldC5hcHBlbmQoXCI8dGQgY2xhc3M9XFxcInJhdGluZ1xcXCI+XCIrIGRhdGEuaW1kYlJhdGluZyArXCI8L3RkPlwiKTtcbiAgJHRhcmdldC5hcHBlbmQoXCI8dGQ+PGJ1dHRvbiBjbGFzcz0nYnRuIGJ0bi1kZWZhdWx0IGJ0bi14cyc+XCIrIFwiJm5ic3A7WCZuYnNwO1wiICtcIjwvYnV0dG9uPjwvdGQ+XCIpO1xufVxuXG5cbi8vZGVsZXRlcyByb3cgZnJvbSB0YWJsZSBhbmQgZmlyZWJhc2VcbiR0YWJsZS5vbignY2xpY2snLCAnYnV0dG9uJywgZnVuY3Rpb24oKXtcbiAgdmFyICRtb3ZpZSA9ICQodGhpcykuY2xvc2VzdCgndHInKTtcbiAgdmFyICRpZCA9ICRtb3ZpZS5hdHRyKCdkYXRhLWlkJyk7XG4gICRtb3ZpZS5yZW1vdmUoKTtcbiAgdmFyIGRlbGV0ZVVSTCA9IEZJUkVCQVNFX1VSTC5zbGljZSgwLCAtNSkgKyAnLycgKyAkaWQgKyAnLmpzb24nO1xuICAkLmFqYXgoe1xuICB1cmw6IGRlbGV0ZVVSTCxcbiAgdHlwZTogJ0RFTEVURSdcbiAgfSk7Y29uc29sZS5sb2coZGVsZXRlVVJMKTtcbn0pO1xuXG4iXX0=
