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

$('.onLoggedIn form').submit(function () {
  var url = $('.onLoggedIn input[type="url"]').val();

  movies.push(url, function (err) {
    console.log(err);
  });

  event.preventDefault();
});

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
    // window.location.reload();
    window.location.href = window.location.href;
  });
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
        // window.location.reload();
        window.location.href = window.location.href;
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
    window.location.href = window.location.href;
  });
  event.preventDefault();
});

function clearForms() {
  $('input[type="text"], input[type="url"]').val('');
}

function saveAuthData(authData) {
  $.ajax({
    method: 'PUT',
    url: '' + FIREBASE_URL + '/users/' + authData.uid + '/profile.json?auth=' + authData.token,
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

function addMovieToDom(movie) {
  if (movie) {
    var uuid = Object.keys(movie)[0];
    $('<img src="' + movie[uuid] + '" data-uid="' + uuid + '">').appendTo($('.favMovies'));
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
      $('.onLoggedIn h1').text('Hey there, ' + authData.password.email);

      movies = fb.child('users/' + fb.getAuth().uid + '/movies');
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
//# sourceMappingURL=data:application/json;base64,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S0FFSixNQUFNOztBQUVMLGlCQUFXLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2xDLGdCQUFVLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzlCLG9CQUFjLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ25DO0dBQ0Y7O0FBRUQsVUFBUSxHQUFHLEtBQUssQ0FBQztDQUNsQixDQUFDLENBQUMiLCJmaWxlIjoic3JjL2pzL21haW4yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypqc2hpbnQgdW51c2VkOiB0cnVlLCBub2RlOiB0cnVlICovXG4vKmpzbGludCB1bnBhcmFtOiB0cnVlLCBub2RlOiB0cnVlICovXG4vKmpzaGludCAtVzExNyAqLyAvKmpzaGludCAtVzA5OCAqL1xuXG52YXIgb21kYl9VUkwgPSAnaHR0cDovL3d3dy5vbWRiYXBpLmNvbS8/JztcbnZhciAkc2VhcmNoRm9ybSA9ICQoJy5zZWFyY2gtZm9ybScpO1xudmFyICRzZWFyY2hCYXIgPSAkKCdpbnB1dFtuYW1lPXNlYXJjaF0nKVswXTtcbnZhciBGSVJFQkFTRV9VUkwgPSBcImh0dHBzOi8vZWFtZGIuZmlyZWJhc2Vpby5jb20vXCI7XG52YXIgZmIgPSBuZXcgRmlyZWJhc2UoRklSRUJBU0VfVVJMKTtcbnZhciBtb3ZpZXM7XG52YXIgJG1vdmllRGV0YWlscyA9ICQoXCIubW92aWUtZGV0YWlsc1wiKTtcbnZhciAkdGFibGUgPSAkKFwidGFibGVcIik7XG52YXIgaW5pdExvYWQgPSB0cnVlO1xudmFyIGF1dGhEYXRhID0gZmIuZ2V0QXV0aCgpO1xuXG5cbiQoJy5vbkxvZ2dlZEluIGZvcm0nKS5zdWJtaXQoZnVuY3Rpb24gKCkge1xuICB2YXIgdXJsID0gJCgnLm9uTG9nZ2VkSW4gaW5wdXRbdHlwZT1cInVybFwiXScpLnZhbCgpO1xuICBcbiAgbW92aWVzLnB1c2godXJsLCBmdW5jdGlvbihlcnIpe1xuICAgIGNvbnNvbGUubG9nKGVycik7XG4gIH0pXG4gIFxuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xufSlcblxuJCgnLm9uVGVtcFBhc3N3b3JkIGZvcm0nKS5zdWJtaXQoZnVuY3Rpb24gKCkge1xuICB2YXIgZW1haWwgPSBmYi5nZXRBdXRoKCkucGFzc3dvcmQuZW1haWw7XG4gIHZhciBvbGRQdyA9ICQoJy5vblRlbXBQYXNzd29yZCBpbnB1dDpudGgtY2hpbGQoMSknKS52YWwoKTtcbiAgdmFyIG5ld1B3ID0gJCgnLm9uVGVtcFBhc3N3b3JkIGlucHV0Om50aC1jaGlsZCgyKScpLnZhbCgpO1xuICBcbiAgZmIuY2hhbmdlUGFzc3dvcmQoe1xuICAgIGVtYWlsOiBlbWFpbCxcbiAgICBvbGRQYXNzd29yZDogb2xkUHcsXG4gICAgbmV3UGFzc3dvcmQ6IG5ld1B3XG4gIH0sIGZ1bmN0aW9uKGVycikge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGFsZXJ0KGVyci50b1N0cmluZygpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZmIudW5hdXRoKCk7XG4gICAgfVxuICB9KTtcbiAgXG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG59KVxuXG4kKCcuZG9SZXNldFBhc3N3b3JkJykuY2xpY2soZnVuY3Rpb24gKCkge1xuICB2YXIgZW1haWwgPSAkKCcub25Mb2dnZWRPdXQgaW5wdXRbdHlwZT1cImVtYWlsXCJdJykudmFsKCk7XG4gIFxuICBmYi5yZXNldFBhc3N3b3JkKHtcbiAgICBlbWFpbDogZW1haWxcbiAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGFsZXJ0KGVyci50b1N0cmluZygpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYWxlcnQoJ0NoZWNrIHlvdXIgZW1haWwhJyk7XG4gICAgfVxuICB9KTtcbn0pO1xuXG4kKCcuZG9Mb2dvdXQnKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gIGZiLnVuYXV0aChmdW5jdGlvbiAoKSB7XG4gICAgLy8gd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xud2luZG93LmxvY2F0aW9uLmhyZWY9d2luZG93LmxvY2F0aW9uLmhyZWY7XG4gIH0pO1xufSlcblxuJCgnLmRvUmVnaXN0ZXInKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gIHZhciBlbWFpbCA9ICQoJy5vbkxvZ2dlZE91dCBpbnB1dFt0eXBlPVwiZW1haWxcIl0nKS52YWwoKTtcbiAgdmFyIHBhc3N3b3JkID0gJCgnLm9uTG9nZ2VkT3V0IGlucHV0W3R5cGU9XCJwYXNzd29yZFwiXScpLnZhbCgpO1xuXG4gIGZiLmNyZWF0ZVVzZXIoe1xuICAgIGVtYWlsOiBlbWFpbCxcbiAgICBwYXNzd29yZDogcGFzc3dvcmRcbiAgfSwgZnVuY3Rpb24gKGVyciwgdXNlckRhdGEpIHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBhbGVydChlcnIudG9TdHJpbmcoKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNsZWFyRm9ybXMoKTtcbiAgICAgIGRvTG9naW4oZW1haWwsIHBhc3N3b3JkLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmPXdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcbiAgXG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG59KTtcblxuJCgnLm9uTG9nZ2VkT3V0IGZvcm0nKS5zdWJtaXQoZnVuY3Rpb24gKCkge1xuICB2YXIgZW1haWwgPSAkKCcub25Mb2dnZWRPdXQgaW5wdXRbdHlwZT1cImVtYWlsXCJdJykudmFsKCk7XG4gIHZhciBwYXNzd29yZCA9ICQoJy5vbkxvZ2dlZE91dCBpbnB1dFt0eXBlPVwicGFzc3dvcmRcIl0nKS52YWwoKTtcblxuICBkb0xvZ2luKGVtYWlsLCBwYXNzd29yZCwgZnVuY3Rpb24gKCkge1xuICAgIC8vIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbndpbmRvdy5sb2NhdGlvbi5ocmVmPXdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuICB9KTtcbiAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbn0pO1xuXG5mdW5jdGlvbiBjbGVhckZvcm1zICgpIHtcbiAgJCgnaW5wdXRbdHlwZT1cInRleHRcIl0sIGlucHV0W3R5cGU9XCJ1cmxcIl0nKS52YWwoJycpO1xufVxuXG5mdW5jdGlvbiBzYXZlQXV0aERhdGEgKGF1dGhEYXRhKSB7XG4gICQuYWpheCh7XG4gICAgbWV0aG9kOiAnUFVUJyxcbiAgICB1cmw6IGAke0ZJUkVCQVNFX1VSTH0vdXNlcnMvJHthdXRoRGF0YS51aWR9L3Byb2ZpbGUuanNvbj9hdXRoPSR7YXV0aERhdGEudG9rZW59YCxcbiAgICBkYXRhOiBKU09OLnN0cmluZ2lmeShhdXRoRGF0YSlcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGRvTG9naW4gKGVtYWlsLCBwYXNzd29yZCwgY2IpIHtcbiAgZmIuYXV0aFdpdGhQYXNzd29yZCh7XG4gICAgZW1haWw6IGVtYWlsLFxuICAgIHBhc3N3b3JkOiBwYXNzd29yZFxuICB9LCBmdW5jdGlvbiAoZXJyLCBhdXRoRGF0YSkge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGFsZXJ0KGVyci50b1N0cmluZygpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2F2ZUF1dGhEYXRhKGF1dGhEYXRhKTtcbiAgICAgIHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJyAmJiBjYihhdXRoRGF0YSk7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gYWRkTW92aWVUb0RvbSAobW92aWUpIHtcbiAgaWYgKG1vdmllKSB7XG4gICAgdmFyIHV1aWQgPSBPYmplY3Qua2V5cyhtb3ZpZSlbMF07XG4gICAgJChgPGltZyBzcmM9XCIke21vdmllW3V1aWRdfVwiIGRhdGEtdWlkPVwiJHt1dWlkfVwiPmApLmFwcGVuZFRvKCQoJy5mYXZNb3ZpZXMnKSk7XG4gIH1cbn1cblxuZmIub25BdXRoKGZ1bmN0aW9uIChhdXRoRGF0YSkge1xuICBpZiAoaW5pdExvYWQpIHtcbiAgICB2YXIgb25Mb2dnZWRPdXQgPSAkKCcub25Mb2dnZWRPdXQnKTtcbiAgICB2YXIgb25Mb2dnZWRJbiA9ICQoJy5vbkxvZ2dlZEluJyk7XG4gICAgdmFyIG9uVGVtcFBhc3N3b3JkID0gJCgnLm9uVGVtcFBhc3N3b3JkJyk7XG5cbiAgICBpZiAoYXV0aERhdGEgJiYgYXV0aERhdGEucGFzc3dvcmQuaXNUZW1wb3JhcnlQYXNzd29yZCkge1xuICAgICAgLy8gdGVtcG9yYXJ5IGxvZyBpblxuICAgICAgb25UZW1wUGFzc3dvcmQucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgb25Mb2dnZWRJbi5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgICBvbkxvZ2dlZE91dC5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgfSBlbHNlIGlmIChhdXRoRGF0YSkge1xuICAgICAgLy8gbG9nZ2VkIGluXG4gICAgICBvbkxvZ2dlZEluLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICAgIG9uTG9nZ2VkT3V0LmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAgIG9uVGVtcFBhc3N3b3JkLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAgICQoJy5vbkxvZ2dlZEluIGgxJykudGV4dChgSGV5IHRoZXJlLCAke2F1dGhEYXRhLnBhc3N3b3JkLmVtYWlsfWApO1xuICAgICAgXG4gICAgICBtb3ZpZXMgPSBmYi5jaGlsZChgdXNlcnMvJHtmYi5nZXRBdXRoKCkudWlkfS9tb3ZpZXNgKTtcbiAgICAgIG1vdmllcy5vbignY2hpbGRfYWRkZWQnLCBmdW5jdGlvbiAoc25hcHNob3QpIHtcbiAgICAgICAgdmFyIG9iaiA9IHt9O1xuICAgICAgICBvYmpbc25hcHNob3Qua2V5KCldID0gc25hcHNob3QudmFsKCk7XG4gICAgICAgIGFkZE1vdmllVG9Eb20ob2JqKTtcbiAgICAgICAgY29uc29sZS5sb2coYXV0aERhdGEpO1xuICAgICAgfSk7XG4gICAgICBcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gb24gbG9nZ2VkIG91dFxuICAgICAgb25Mb2dnZWRPdXQucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgb25Mb2dnZWRJbi5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgICBvblRlbXBQYXNzd29yZC5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgfVxuICB9XG4gIFxuICBpbml0TG9hZCA9IGZhbHNlO1xufSk7XG4iXX0=
