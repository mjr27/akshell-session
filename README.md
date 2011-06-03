# Akshell Sessions

* This package provides support for django-like sessions
* Session is represented as "session" property of request object

Current limitations:

* Sessions are database-based only


## Usage

    /**
     * Initialization
     */

    var session = require("session").init();
    exports.main = defaultServe.decorated(session.middleware);

    /**
     * In handler
     */
    var TestHandler = Handler.subclass({
      get: function(request){
        request.session.views = (request.session.views || 0) + 1;
        return new Response("Page was shown "+ request.session.views + " times");
      }
    });

    /**
     * Force session saving
     */
    request.session.save();
