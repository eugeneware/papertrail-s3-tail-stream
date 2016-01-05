var s3TailStream = require('s3-tail-stream'),
    clone = require('clone'),
    moment = require('moment'),
    split = require('split2'),
    zlib = require('zlib'),
    combine = require('stream-combiner'),
    sl = require('streamlined');

module.exports = papertrailS3TailStream;
function papertrailS3TailStream(_opts) {

  var opts = clone(_opts);

  var fromDate = _opts.query.from || null;

  if (fromDate !== null) {
    var marker = opts.query.Prefix + 'dt=' +
      moment(fromDate).utcOffset(0).subtract(1, 'hours')
        .format('YYYY-MM-DD/YYYY-MM-DD-HH') + '.tsv.gz';
    opts.query.Marker = marker;
  }

  opts.uncompress = zlib.createGunzip;
  var s3s = s3TailStream(opts);
  var pipes = [
    s3s,
    split(),
    sl.map(tabSplit, logMap)
  ];

  if (fromDate !== null) {
    pipes.push(sl.where(function (entry) {
      return entry.generated_at >= fromDate;
    }));
  }

  var rs = combine(pipes);
  s3s.on('s3-object', function (obj) {
    rs.emit('s3-object', obj)
  });

  return rs;
}

function tabSplit(data) {
  return data.split('\t');
}

function logMap(data) {
  return {
    id: data[0],
    received_at: new Date(data[1]),
    generated_at: new Date(data[2]),
    source_id: data[3],
    source_name: data[4],
    source_ip: data[5],
    facility: data[6],
    severity: data[7],
    program: data[8],
    message: data[9]
  };
  return data;
}
