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
      $('.onLoggedIn h1').text('Hello ' + authData.password.email);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9qcy9teWZpcmViYXNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQztBQUNiLElBQUksWUFBWSxHQUFHLCtCQUErQixDQUFDO0FBQ25ELElBQUksRUFBRSxHQUFHLElBQUksUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3BDLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQzs7QUFFcEIsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsTUFBTSxDQUFDLFlBQVk7QUFDdkMsTUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLCtCQUErQixDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDbkQsTUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUMzQixTQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2pCLE1BQUksS0FBSyxHQUFHLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxLQUFLLENBQUM7QUFDL0IsTUFBSSxPQUFPLEdBQUcsWUFBWSxHQUFHLFNBQVMsR0FBRyxHQUFHLEdBQUcsMEJBQTBCLENBQUM7QUFDMUUsR0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRSxVQUFVLEdBQUcsRUFBRTtBQUNsRCxXQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2pCLFdBQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDbkIsV0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNyQixXQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2pCLGtCQUFjLENBQUM7QUFDYixTQUFHLEVBQUUsR0FBRztLQUNULENBQUMsQ0FBQztBQUNILGNBQVUsRUFBRSxDQUFDOztHQUVkLENBQUMsQ0FBQztBQUNILE9BQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztDQUN4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O1xudmFyIEZJUkVCQVNFX1VSTCA9ICdodHRwczovL2VhbWRiLmZpcmViYXNlaW8uY29tLyc7XG52YXIgZmIgPSBuZXcgRmlyZWJhc2UoRklSRUJBU0VfVVJMKTtcbnZhciBpbml0TG9hZCA9IHRydWU7XG5cbiQoJy5vbkxvZ2dlZEluIGZvcm0nKS5zdWJtaXQoZnVuY3Rpb24gKCkge1xuICB2YXIgdXJsID0gJCgnLm9uTG9nZ2VkSW4gaW5wdXRbdHlwZT1cInVybFwiXScpLnZhbCgpO1xuICB2YXIgdWlkID0gZmIuZ2V0QXV0aCgpLnVpZDtcbiAgY29uc29sZS5sb2codWlkKTtcbiAgdmFyIHRva2VuID0gZmIuZ2V0QXV0aCgpLnRva2VuO1xuICB2YXIgcG9zdFVybCA9IEZJUkVCQVNFX1VSTCArICcvdXNlcnMvJyArIHVpZCArICcvbW92aWVzLmpzb24/YXV0aD0kdG9rZW4nO1xuICAkLnBvc3QocG9zdFVybCwgSlNPTi5zdHJpbmdpZnkodXJsKSwgZnVuY3Rpb24gKHJlcykge1xuICAgIGNvbnNvbGUubG9nKHVybCk7XG4gICAgY29uc29sZS5sb2codG9rZW4pO1xuICAgIGNvbnNvbGUubG9nKHBvc3RVcmwpO1xuICAgIGNvbnNvbGUubG9nKHVpZCk7XG4gICAgYWRkTW92aWVzVG9Eb20oe1xuICAgICAgdXJsOiB1cmxcbiAgICB9KTtcbiAgICBjbGVhckZvcm1zKCk7XG4gICAgLy8gcmVzID0geyBuYW1lOiAnLUprNGRmRGQxMjMnIH1cbiAgfSk7XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG59KVxuXG4kKCcub25UZW1wUGFzc3dvcmQgZm9ybScpLnN1Ym1pdChmdW5jdGlvbiAoKSB7XG4gIHZhciBlbWFpbCA9IGZiLmdldEF1dGgoKS5wYXNzd29yZC5lbWFpbDtcbiAgdmFyIG9sZFB3ID0gJCgnLm9uVGVtcFBhc3N3b3JkIGlucHV0Om50aC1jaGlsZCgxKScpLnZhbCgpO1xuICB2YXIgbmV3UHcgPSAkKCcub25UZW1wUGFzc3dvcmQgaW5wdXQ6bnRoLWNoaWxkKDIpJykudmFsKCk7XG4gIGZiLmNoYW5nZVBhc3N3b3JkKHtcbiAgICBlbWFpbDogZW1haWwsXG4gICAgb2xkUGFzc3dvcmQ6IG9sZFB3LFxuICAgIG5ld1Bhc3N3b3JkOiBuZXdQd1xuICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgaWYgKGVycikge1xuICAgICAgYWxlcnQoZXJyLnRvU3RyaW5nKCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBmYi51bmF1dGgoKTtcbiAgICB9XG4gIH0pO1xuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xufSlcbiQoJy5kb1Jlc2V0UGFzc3dvcmQnKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gIHZhciBlbWFpbCA9ICQoJy5vbkxvZ2dlZE91dCBpbnB1dFt0eXBlPVwiZW1haWxcIl0nKS52YWwoKTtcbiAgZmIucmVzZXRQYXNzd29yZCh7XG4gICAgZW1haWw6IGVtYWlsXG4gIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBhbGVydChlcnIudG9TdHJpbmcoKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFsZXJ0KCdDaGVjayB5b3VyIGVtYWlsIScpO1xuICAgIH1cbiAgfSk7XG59KTtcbiQoJy5kb0xvZ291dCcpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgZmIudW5hdXRoKGZ1bmN0aW9uICgpIHtcbiAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gIH0pO1xufSlcbiQoXCIuZ29Ub01vdmllc1wiKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gIHdpbmRvdy5sb2NhdGlvbiA9IFwibW92aWVzLmh0bWxcIjtcbn0pO1xuJCgnLmRvUmVnaXN0ZXInKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gIHZhciBlbWFpbCA9ICQoJy5vbkxvZ2dlZE91dCBpbnB1dFt0eXBlPVwiZW1haWxcIl0nKS52YWwoKTtcbiAgdmFyIHBhc3N3b3JkID0gJCgnLm9uTG9nZ2VkT3V0IGlucHV0W3R5cGU9XCJwYXNzd29yZFwiXScpLnZhbCgpO1xuICBmYi5jcmVhdGVVc2VyKHtcbiAgICBlbWFpbDogZW1haWwsXG4gICAgcGFzc3dvcmQ6IHBhc3N3b3JkXG4gIH0sIGZ1bmN0aW9uIChlcnIsIHVzZXJEYXRhKSB7XG4gICAgaWYgKGVycikge1xuICAgICAgYWxlcnQoZXJyLnRvU3RyaW5nKCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjbGVhckZvcm1zKCk7XG4gICAgICBkb0xvZ2luKGVtYWlsLCBwYXNzd29yZCwgZnVuY3Rpb24gKCkge1xuICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xufSk7XG4kKCcub25Mb2dnZWRPdXQgZm9ybScpLnN1Ym1pdChmdW5jdGlvbiAoKSB7XG4gIHZhciBlbWFpbCA9ICQoJy5vbkxvZ2dlZE91dCBpbnB1dFt0eXBlPVwiZW1haWxcIl0nKS52YWwoKTtcbiAgdmFyIHBhc3N3b3JkID0gJCgnLm9uTG9nZ2VkT3V0IGlucHV0W3R5cGU9XCJwYXNzd29yZFwiXScpLnZhbCgpO1xuICBkb0xvZ2luKGVtYWlsLCBwYXNzd29yZCwgZnVuY3Rpb24gKCkge1xuICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgfSk7XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG59KTtcbmZ1bmN0aW9uIGNsZWFyRm9ybXMoKSB7XG4gICQoJ2lucHV0W3R5cGU9XCJ0ZXh0XCJdLCBpbnB1dFt0eXBlPVwiZW1haWxcIl0sIGlucHV0W3R5cGU9XCJwYXNzd29yZFwiXSwgaW5wdXRbdHlwZT1cInVybFwiXScpLnZhbCgnJyk7XG59XG5mdW5jdGlvbiBzYXZlQXV0aERhdGEoYXV0aERhdGEpIHtcbiAgJC5hamF4KHtcbiAgICBtZXRob2Q6ICdQVVQnLFxuICAgIHVybDogYCR7RklSRUJBU0VfVVJMfXVzZXJzLyR7YXV0aERhdGEudWlkfS9wcm9maWxlLmpzb24/YXV0aD0ke2F1dGhEYXRhLnRva2VufWAsXG4gICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoYXV0aERhdGEpXG4gIH0pO1xufVxuZnVuY3Rpb24gZG9Mb2dpbihlbWFpbCwgcGFzc3dvcmQsIGNiKSB7XG4gIGZiLmF1dGhXaXRoUGFzc3dvcmQoe1xuICAgIGVtYWlsOiBlbWFpbCxcbiAgICBwYXNzd29yZDogcGFzc3dvcmRcbiAgfSwgZnVuY3Rpb24gKGVyciwgYXV0aERhdGEpIHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBhbGVydChlcnIudG9TdHJpbmcoKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNhdmVBdXRoRGF0YShhdXRoRGF0YSk7XG4gICAgICB0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicgJiYgY2IoYXV0aERhdGEpO1xuICAgIH1cbiAgfSk7XG59XG5mdW5jdGlvbiBnZXRVc2VyRGF0YShjYikge1xuICB2YXIgdWlkID0gZmIuZ2V0QXV0aCgpLnVpZDtcbiAgdmFyIHRva2VuID0gZmIuZ2V0QXV0aCgpLnRva2VuO1xuICB2YXIgZ2V0VXJsID0gYCR7RklSRUJBU0VfVVJMfS91c2Vycy8ke3VpZH0vbW92aWVzLmpzb24/YXV0aD0ke3Rva2VufWA7XG4gICQuZ2V0KGdldFVybCwgY2IpO1xufVxuZnVuY3Rpb24gYWRkTW92aWVzVG9Eb20obW92aWVzKSB7XG4gIGlmIChtb3ZpZXMpIHtcbiAgICBPYmplY3Qua2V5cyhtb3ZpZXMpLmZvckVhY2goZnVuY3Rpb24gKHV1aWQpIHtcbiAgICAgICQoYDxpbWcgc3JjPVwiJHttb3ZpZXNbdXVpZF19XCIgZGF0YS11aWQ9XCIke3V1aWR9XCI+YCkuYXBwZW5kVG8oJCgnLmZhdk1vdmllcycpKTtcbiAgICB9KVxuICB9XG59XG5cblxuXG4vKlxuJCgnLm9uTG9nZ2VkSW4gZm9ybScpLnN1Ym1pdChmdW5jdGlvbiAoKSB7XG4gIGRlYnVnZ2VyO1xuICB2YXIgdXJsID0gJCgnLm9uTG9nZ2VkSW4gaW5wdXRbdHlwZT1cInVybFwiXScpLnZhbCgpO1xuICB2YXIgdWlkID0gZmIuZ2V0QXV0aCgpLnVpZDtcbiAgdmFyIHRva2VuID0gZmIuZ2V0QXV0aCgpLnRva2VuO1xuICAvL3ZhciBwb3N0VXJsID0gYCR7RklSRUJBU0VfVVJMfXVzZXJzLyR7dWlkfS9tb3ZpZXMuanNvbj9hdXRoPSR7dG9rZW59YDsvL2RvZXNuJ3QgbGlrZSBiYWJlbCB5ZXRcbiAgICB2YXIgcG9zdFVybCA9IEZJUkVCQVNFX1VSTCArICcvdXNlcnMvJyArIHVpZCArICcvbW92aWVzLmpzb24/YXV0aD0kdG9rZW4nOyQucG9zdChwb3N0VXJsLCBKU09OLnN0cmluZ2lmeSh1cmwpLCBmdW5jdGlvbiAocmVzKSB7XG4gICAgY29uc29sZS5sb2codXJsKTtcbiAgICBjb25zb2xlLmxvZyh0b2tlbik7XG4gICAgY29uc29sZS5sb2cocG9zdFVybCk7XG4gICAgY29uc29sZS5sb2codWlkKTtcbiAgICBhZGRNb3ZpZXNUb0RvbSh7XG4gICAgICB1cmw6IHVybFxuICAgIH0pO1xuICAgIGNsZWFyRm9ybXMoKTtcbiovXG5cblxuZmIub25BdXRoKGZ1bmN0aW9uIChhdXRoRGF0YSkge1xuICBpZiAoaW5pdExvYWQpIHtcbiAgICB2YXIgb25Mb2dnZWRPdXQgPSAkKCcub25Mb2dnZWRPdXQnKTtcbiAgICB2YXIgb25Mb2dnZWRJbiA9ICQoJy5vbkxvZ2dlZEluJyk7XG4gICAgdmFyIG9uVGVtcFBhc3N3b3JkID0gJCgnLm9uVGVtcFBhc3N3b3JkJyk7XG4gICAgaWYgKGF1dGhEYXRhICYmIGF1dGhEYXRhLnBhc3N3b3JkLmlzVGVtcG9yYXJ5UGFzc3dvcmQpIHtcbiAgICAgIC8vIHRlbXBvcmFyeSBsb2cgaW5cbiAgICAgIG9uVGVtcFBhc3N3b3JkLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICAgIG9uTG9nZ2VkSW4uYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgb25Mb2dnZWRPdXQuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgIH0gZWxzZSBpZiAoYXV0aERhdGEpIHtcbiAgICAgIC8vIGxvZ2dlZCBpblxuICAgICAgb25Mb2dnZWRJbi5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgICBvbkxvZ2dlZE91dC5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgICBvblRlbXBQYXNzd29yZC5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgICAkKCcub25Mb2dnZWRJbiBoMScpLnRleHQoYEhlbGxvICR7YXV0aERhdGEucGFzc3dvcmQuZW1haWx9YCk7XG4gICAgICAvL2dldFVzZXJEYXRhKGZ1bmN0aW9uICh1cmxzKSB7XG4gICAgICAvLyAgYWRkTW92aWVzVG9Eb20odXJscyk7XG5cbiAgdmFyIHVybCA9ICQoJy5vbkxvZ2dlZEluIGlucHV0W3R5cGU9XCJ1cmxcIl0nKS52YWwoKTtcbiAgdmFyIHVpZCA9IGZiLmdldEF1dGgoKS51aWQ7XG4gIHZhciB0b2tlbiA9IGZiLmdldEF1dGgoKS50b2tlbjtcbiAgLy92YXIgcG9zdFVybCA9IGAke0ZJUkVCQVNFX1VSTH11c2Vycy8ke3VpZH0vbW92aWVzLmpzb24/YXV0aD0ke3Rva2VufWA7Ly9kb2Vzbid0IGxpa2UgYmFiZWwgeWV0XG4gICAgdmFyIHBvc3RVcmwgPSBGSVJFQkFTRV9VUkwgKyAndXNlcnMvJyArIHVpZCArICcvbW92aWVzLmpzb24/YXV0aD0kdG9rZW4nOyQucG9zdChwb3N0VXJsLCBKU09OLnN0cmluZ2lmeSh1cmwpLCBmdW5jdGlvbiAocmVzKSB7XG4gICAgY29uc29sZS5sb2codXJsKTtcbiAgICBjb25zb2xlLmxvZyh0b2tlbik7XG4gICAgY29uc29sZS5sb2cocG9zdFVybCk7XG4gICAgY29uc29sZS5sb2codWlkKTtcbiAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gb24gbG9nZ2VkIG91dFxuICAgICAgb25Mb2dnZWRPdXQucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgb25Mb2dnZWRJbi5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgICBvblRlbXBQYXNzd29yZC5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgfVxuICAgIGNsZWFyRm9ybXMoKTtcbiAgfVxuICBpbml0TG9hZCA9IGZhbHNlO1xufSk7XG4iXX0=
