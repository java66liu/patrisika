var recurse = require('./node-types.js').recurse;

var composite = function(passes, config){
	var steps = [];
	for(var j = 0; j < passes.length; j++){
		steps[j] = passes[j].Pass(config)
	}
	return function(node){
		for(var j = 0; j < steps.length; j++){
			node = steps[j](node)
		}
		return node;
	}
}
exports.composite = composite;

var APassFor = function(type, handler){
	return function(config) {
		var f = function(node, aux){
			if(!(node instanceof Array)) return node;
			recurse(node, f, aux);
			if(node[0] === type) {
				return handler(node, aux)
			} else {
				return node;
			}
		}

		return f;
	}
}
exports.APassFor = APassFor;