var async = require('async');
var keystone = require('../../../../');

module.exports = function(req, res) {
	if (!keystone.security.csrf.validate(req)) {
		console.log('Refusing to delete ' + req.list.key + ' items; CSRF failure');
		return res.apiError(403, 'invalid csrf');
	}
	if (req.list.get('nodelete')) {
		console.log('Refusing to delete ' + req.list.key + ' items; List.nodelete is true');
		return res.apiError(400, 'nodelete');
	}
	var ids = req.body.ids || req.body.id;
	if (typeof ids === 'string') {
		ids = ids.split(',');
	}
	if (!Array.isArray(ids)) {
		return res.apiError(400, 'invalid ids', 'ids must be an Array or comma-delimited list of ids');
	}
	if (req.user) {
		var userId = String(req.user.id);
		if (ids.some(function(id) {
			return id === userId;
		})) {
			console.log('Refusing to delete ' + req.list.key + ' items; ids contains current User');
			return res.apiError(403, 'not allowed', 'You can not delete yourself');
		}
	}
	var deletedCount = 0;
	var deletedIds = [];
	req.list.model.find().where('_id').in(ids).exec(function (err, results) {
		if (err) {
			console.log('Error deleting ' + req.list.key + ' items:', err);
			return res.apiError('database error', err);
		}
		async.forEachLimit(results, 10, function(item, next) {
			item.remove(function (err) {
				if (err) return next(err);
				deletedCount++;
				deletedIds.push(item.id);
				next();
			});
		}, function() {
			return res.json({
				success: true,
				ids: deletedIds,
				count: deletedCount
			});
		});
	});
};
