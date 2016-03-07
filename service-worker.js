'use strict';

importScripts("https://web-push.github.io/Test/js/KiiSDK.js");

var username = "test_user";
var password = "1234567890";

self.addEventListener('push', function(event) {
  console.log('Received a push message', event);
  Kii.initializeWithSite("5a2ac7b1", "1bc385a570612507bb8740ba861b14cb", KiiSite.JP);
  // Subscription ID取得
  //self.registration.pushManager.getSubscription().then(function(subscription) {
  //  console.log("got subscription id: ", subscription.endpoint);
  //  var subscriptionid = subscription.endpoint.split("/").slice(-1);
  //});

  event.waitUntil(
    getList().then(function() {
      console.log('hoge');
    }, function(error) {
      console.log('error');
    });
  );
  
  var title = 'Yay a message.';
  var body = 'We have received a push message.';
  var icon = '/images/icon-192x192.png';
  var tag = 'simple-push-demo-notification-tag';
  event.waitUntil(
    fetch('https://web-push.github.io/Test/fetch.php').then(function(response){
      if (response.status !== 200) {
        console.log('Looks like there was a problem. Status Code: ' + response.status);
        throw new Error();
      }
      return response.json().then(function(data) {
        self.registration.showNotification(data.title, {
          body: data.message,
          icon: icon,
          tag: tag
        })
      })
    })
  );
});

var getList = function() {
  return new Promise(function(resolve, reject) {
  KiiUser.authenticate(username, password, {
    // Called on successful authentication
    success: function(theUser) {
        var bucket = Kii.bucketWithName("test_bucket");
        // Build "all" query
        var all_query = KiiQuery.queryWithClause();

        // Define the callbacks
        var queryCallbacks = {
          success: function(queryPerformed, resultSet, nextQuery) {
            // ulタグを生成してinsertに追加
            var insert = $('<ul>').addClass('list');
            for(var i=0; i < resultSet.length; i++) {
              var id = resultSet[i].get("subscriptionId");
            }
            if(nextQuery != null) {
              // There are more results (pages).
              // Execute the next query to get more results.
             bucket.executeQuery(nextQuery, queryCallbacks);
            }
            resolve();
          },
          failure: function(queryPerformed, anErrorString) {
            reject();
            // do something with the error response
          }
        }
        // Execute the query
        bucket.executeQuery(all_query, queryCallbacks);
    },
    // Called on a failed authentication
    failure: function(theUser, errorString) {
      // Print some info to the log
      console.log("Error authenticating: " + errorString);
      reject();
    }
  })
  });
};

self.addEventListener('notificationclick', function(event) {
  console.log('On notification click: ', event.notification.tag);
  // Android doesn’t close the notification when you click on it
  // See: http://crbug.com/463146
  event.notification.close();

  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(clients.matchAll({
    type: 'window'
  }).then(function(clientList) {
    for (var i = 0; i < clientList.length; i++) {
      var client = clientList[i];
      if (client.url === '/' && 'focus' in client) {
        return client.focus();
      }
    }
    if (clients.openWindow) {
      return clients.openWindow('/');
    }
  }));
});
