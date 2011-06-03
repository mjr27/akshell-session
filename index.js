var _SESSION_KEY = "AKSID";
var _session_table = null;

function _generateGuid(){
  var result, i, j;
  result = '';
  for(j=0; j<32; j++){
    if( j === 8 || j === 12|| j === 16|| j === 20){
      result = result + '-';
    }
    i = Math.floor(Math.random()*16).toString(16).toUpperCase();
    result = result + i;
  }
  return result;
}

var session_middleware = function(func){
  return function (request) {
    var expires_at =  new Date();
    expires_at.setYear(expires_at.getFullYear() + 1);

    var session_id = request.get[_SESSION_KEY] || request.cookies[_SESSION_KEY] || null;

    request.session = undefined;
    request.session_id = session_id;

    if (session_id !== null){
      try{
        var session = _session_table.where("sid == $", session_id).getOne();
        request.session = session.data;
      }catch(e){
        
      }
    }

    if (!request.session){
      session_id = _generateGuid();
      var session = _session_table.insert({sid: session_id, data: {}});
      request.session = {};
    }

    if (request.session){
      request.session.save = function(){
        _session_table.where("sid == $", session_id).set({data:request.session});
      };
    }
    var response = func(request);

    if(response instanceof Response){
      response.setCookie(_SESSION_KEY, session_id, {'expires': expires_at});
    }

    request.session.save();

    return response;
  };
};

exports.middleware = session_middleware;

exports.init=function(sessionTable){
  _session_table = sessionTable;
  return this;
}
