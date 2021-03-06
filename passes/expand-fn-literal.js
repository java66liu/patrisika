/// Pass Expand Function Literals
/// abbr. xfl
/// In this pass, parameters of Function literals are simplified into
/// [.list (id | [.t id])*]

var APassFor = require('../common/pass').APassFor
var mt = require('../common/tempname').TMaker('xfl')
var nodeIsOperation = require('../common/node-types').nodeIsOperation
var recurse = require('../common/node-types').recurse

exports.Pass = APassFor(
	[['.fn', '...'], function(node){
		var parameters = node[1];
		var body = ['.seq', node[2]];
		if(!(parameters instanceof Array && parameters.length === 0) && (!nodeIsOperation(parameters) || parameters[0] !== '.list')) {
			/// functions with parameter involving the whole arguments
			body = ['.seq', ['.def', parameters, ['.args']], body]
			parameters = ['.list']
			return ['.fn', parameters, body]
		} else {
			/// "regular" multiple-parameter function
			var jFirstIrregularNode;
			var jFirstOptionalNode;
			for(var j = 1; j < parameters.length; j++) {
				if(typeof parameters[j] !== 'string' && !jFirstIrregularNode){
					jFirstIrregularNode = j;
				};
				if(nodeIsOperation(parameters[j]) && parameters[j][0] === '.optp') {
					if(!jFirstOptionalNode) {
						jFirstOptionalNode = j;
					}
				} else if (jFirstOptionalNode) {
					throw ['This parameter must be optional.', parameters]
				}
			};
			if(jFirstIrregularNode) {
				/// ensures that jFirstIrregularNode <= jFirstOptionalNode
				if(!jFirstOptionalNode) {
					jFirstOptionalNode = parameters.length;
				}
				var tArgs = mt();
				var sBindings = ['.seq', ['.def', tArgs, ['.args']]];
				for(var j = jFirstIrregularNode; j < jFirstOptionalNode; j++) {
					var t = mt();
					sBindings.push(['.def', parameters[j], t]);
					parameters[j] = t;
				};
				for(var j = jFirstOptionalNode; j < parameters.length; j++) {
					var t = mt();
					sBindings.push(['.if', 
						['<', ['.', tArgs, ['.lit', 'length']], ['.lit', j]],
						['.def', t, parameters[j][2]]
					]);
					sBindings.push(['.def', parameters[j][1], t])
					parameters[j] = t;
				}

				body = ['.seq', sBindings, body];
				return ['.fn', parameters, body]
			} else {
				return ['.fn', parameters, body];
			}
		}
	}])