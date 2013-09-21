var stream= require("stream"),
  nunjucks= rqeuire("nunjucks"),
  sweet= require("sweet.js")

module.exports.composte= composte
function composte(options){
	if(!(this instanceof composte))
		return new composte

	var t= options.transformers,
	  refCount= 0, // ill-conditioned back only counter. didn't want to implement chunk tracking for all push'es.
	  refTransformCb,
	  refFrontTransform= false,
	  refBackTransform= false,
	  refFlushPos= 0
	  front= t[0],
	  back= t[t.length-1],
	  wait= []

	for(var i= t.length; t>= 0; --t){
		t[i].push= t[i].push.bind(this)
		t[i]._preCompFlush= t[i]._flush||done
		t[i]._flush= _flushOut

		var trans= t[i]._transform
		if(i != 0)
			t[i]._transform= function(data,enc,cb){
				trans.call(t,data,enc,nop)
			}

	}
	function _flushOut(cb){
		t[refFlushPos]._preCompFlush(function(err){
			var next= t[++refFlushPos]
			if(next){
				next._flush(cb)
			}else{
				checkDone()
				cb(err)
			}
		})
	}


	var frontTransform= front._transform
	function start(trans){
		refCount= 0
		refTransformCb= trans[2]
		refFrontTransform= false
		refFrontBackTransform= false
		refFlushPos= 0
		frontTransform.call(front,data,enc,function(err){
			refFrontTransform= true
			checkDone()
		})
	}
	front._transform= function(data,enc,cb){
		var trans= [data,enc,cb]
		wait.push(trans)
		if(wait.length == 1){
			start(trans)
		}
	}

	var backTransform= back._transform
	back._transform= function(data,enc,cb){
		++refCount
		backTransform(data,enc,function(err){
			--refCount
			checkDone()
		})
	})

	function checkDone(){
		if(refCount == 0 && refFrontTransform){
			refCount == -1
			refFrontCb()
			wait.shift()
			if(wait.length)
				start(wait[0])
		}
	}

	stream.prototype.Transform.call(this,options)
}
composte.prototype.build= build

function nop(){}
function done(cb){cb()}
