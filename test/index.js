var it = require('tape'),
    papertrailStream = require('..');

var auth = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};

it('should be able to tail from papertrail', function(t) {
  t.plan(23018);
  var opts = {
    auth: auth,
    query: {
      Bucket: 's3-tail-stream',
      Prefix: 'papertrail/logs/412154/'
    }
  };

  var count = 0;
  papertrailStream(opts)
    .on('error', function (err) {
      t.error(err);
    })
    .on('data', function (data) {
      count++;
      t.deepEqual(Object.keys(data), [
        'id', 'received_at', 'generated_at', 'source_id', 'source_name',
        'source_ip', 'facility', 'severity', 'program', 'message']);
    })
    .on('end', function () {
      t.equal(count, 23017);
      t.end();
    });
});

it('should be able to tail from papertrail from a given time', function(t) {
  t.plan(19);
  var fromDate = new Date('Wed Sep 10 2014 07:59:53 GMT+1000 (AEST)');
  var opts = {
    auth: auth,
    query: {
      Bucket: 's3-tail-stream',
      Prefix: 'papertrail/logs/412154/',
      from: fromDate
    }
  };

  var count = 0;
  papertrailStream(opts)
    .on('error', function (err) {
      t.error(err);
    })
    .on('data', function (data) {
      count++;
      t.deepEqual(Object.keys(data), [
        'id', 'received_at', 'generated_at', 'source_id', 'source_name',
        'source_ip', 'facility', 'severity', 'program', 'message']);
    })
    .on('end', function () {
      t.equal(count, 18);
      t.end();
    });
});
