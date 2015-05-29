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


$('.onLoggedIn form').submit(function () {
  var url = $('.onLoggedIn input[type="url"]').val();

  movies.push(url, function(err){
    console.log(err);
  })

  event.preventDefault();
})

$('.onTempPassword form').submit(function () {
  var email = fb.getAuth().password.email;
  var oldPw = $('.onTempPassword input:nth-child(1)').val();
  var newPw = $('.onTempPassword input:nth-child(2)').val();

  fb.changePassword({
    email: email,
    oldPassword: oldPw,
    newPassword: newPw
  }, function(err) {
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
    // window.location.reload();
window.location.href=window.location.href;
  });
})

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
        // window.location.reload();
      window.location.href=window.location.href;
      });
    }
  });

  event.preventDefault();
});

$('.onLoggedOut form').submit(function () {
  var email = $('.onLoggedOut input[type="email"]').val();
  var password = $('.onLoggedOut input[type="password"]').val();

  doLogin(email, password, function () {
    // window.location.reload();
window.location.href=window.location.href;
  });
  event.preventDefault();
});

function clearForms () {
  $('input[type="text"], input[type="url"]').val('');
}

function saveAuthData (authData) {
  $.ajax({
    method: 'PUT',
    url: `${FIREBASE_URL}/users/${authData.uid}/profile.json?auth=${authData.token}`,
    data: JSON.stringify(authData)
  });
}

function doLogin (email, password, cb) {
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

function addMovieToDom (movie) {
  if (movie) {
    var uuid = Object.keys(movie)[0];
    $(`<img src="${movie[uuid]}" data-uid="${uuid}">`).appendTo($('.favMovies'));
  }
}

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
      $('.onLoggedIn h1').text(`Hey there, ${authData.password.email}`);

      movies = fb.child(`users/${fb.getAuth().uid}/movies`);
      movies.on('child_added', function (snapshot) {
        var obj = {};
        obj[snapshot.key()] = snapshot.val();
        addMovieToDom(obj);
        console.log(authData);
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
