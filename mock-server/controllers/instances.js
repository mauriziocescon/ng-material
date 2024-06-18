const lowdb = require('../lowdb');

exports.getInstances = (req, res) => {
  const db = lowdb.getDb();
  const textSearch = req.query.q;
  const start = parseInt(req.query._start) || 0;
  const limit = parseInt(req.query._limit) || 20;

  const instances = db.get('instances')
    .filter(inst => {
      return textSearch === undefined ||
        textSearch === '' ||
        JSON.stringify(inst).toLowerCase().includes(textSearch.toLowerCase());
    })
    .slice(start, start + limit)
    .value();

  // set the number of tasks
  res.setHeader('X-Total-Count', db.get('instances').value().length);

  return res.status(200).jsonp(instances);
};
