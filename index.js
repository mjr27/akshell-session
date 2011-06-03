var _SESSION_KEY = "AKSID";
var _DEFAULT_SESSIONRV_NAME = "Session";
var _session_table = null;

function _getSessionRv(name){
  if(!name){
    name = _DEFAULT_SESSIONRV_NAME;
  }
  if(!rv[name].exists()){
    rv[name].create({
      'sid': 'string unique',
      'data': ['json', {}]
    });
  }
  return rv[name];
}

function getUuid (len, radix) {
  var chars = CHARS, uuid = [], i;
  radix = radix || chars.length;

  // rfc4122, version 4 form
  var r;

  // rfc4122 requires these characters
  uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
  uuid[14] = '4';

  // Fill in random data.  At i==19 set the high bits of clock sequence as
  // per rfc4122, sec. 4.1.5
  for (i = 0; i < 36; i++) {
    if (!uuid[i]) {
      r = 0 | Math.random()*16;
      uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];
    }
  }
  return uuid.join('');
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
      session_id = getUuid();
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
  if(!sessionTable){
    sessionTable = _DEFAULT_SESSIONRV_NAME;
  }
  _session_table = _getSessionRv(sessionTable);
  return this;
};
