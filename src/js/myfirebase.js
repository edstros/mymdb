'use strict';
var FIREBASE_URL = 'https://eamdb.firebaseio.com/';
var fb = new Firebase(FIREBASE_URL);
var initLoad = true;

$('.onLoggedIn form').submit(function () {
  var url = $('.onLoggedIn input[type="url"]').val();
  var uid = fb.getAuth().uid;
  console.log(uid);
  var token = fb.getAuth().token;
  var postUrl = FIREBASE_URL + '/users/' + uid + '/movies.json?auth=$token';
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



/*
$('.onLoggedIn form').submit(function () {
  debugger;
  var url = $('.onLoggedIn input[type="url"]').val();
  var uid = fb.getAuth().uid;
  var token = fb.getAuth().token;
  //var postUrl = `${FIREBASE_URL}users/${uid}/movies.json?auth=${token}`;//doesn't like babel yet
    var postUrl = FIREBASE_URL + '/users/' + uid + '/movies.json?auth=$token';$.post(postUrl, JSON.stringify(url), function (res) {
    console.log(url);
    console.log(token);
    console.log(postUrl);
    console.log(uid);
    addMoviesToDom({
      url: url
    });
    clearForms();
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
      //getUserData(function (urls) {
      //  addMoviesToDom(urls);

  var url = $('.onLoggedIn input[type="url"]').val();
  var uid = fb.getAuth().uid;
  var token = fb.getAuth().token;
  //var postUrl = `${FIREBASE_URL}users/${uid}/movies.json?auth=${token}`;//doesn't like babel yet
    var postUrl = FIREBASE_URL + 'users/' + uid + '/movies.json?auth=$token';$.post(postUrl, JSON.stringify(url), function (res) {
    console.log(url);
    console.log(token);
    console.log(postUrl);
    console.log(uid);
    });
    } else {
      // on logged out
      onLoggedOut.removeClass('hidden');
      onLoggedIn.addClass('hidden');
      onTempPassword.addClass('hidden');
    }
    clearForms();
  }
  initLoad = false;
});
