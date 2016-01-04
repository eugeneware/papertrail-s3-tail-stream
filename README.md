# papertrail-s3-tail-stream

Process and tail logs from papertrail S3 log archives

[![build status](https://secure.travis-ci.org/eugeneware/papertrail-s3-tail-stream.png)](http://travis-ci.org/eugeneware/papertrail-s3-tail-stream)

`papertrail` data is only available through their API for a limited amount of
time, after that the best you can get is to archive to S3.

This module makes it easy to process these logs and also to continously tail
the logs.

## Installation

This module is installed via npm:

``` bash
$ npm install papertrail-s3-tail-stream
```

## Example Usage

``` js
var papertrailStream = require('papertrail-s3-tail-stream');
var fromDate = new Date(Date.now() - 7*24*60*60*1000); // 7 days ago
var opts = {
  auth: {
    accessKeyId: 'YOUR ACCESS KEY ID',
    secretAccessKey: 'YOUR SECRET ACCESS KEY'
  },
  query: {
    Bucket: 's3-tail-stream',
    Prefix: 'papertrail/logs/412154/'
    from: fromDate
  },
  // keep polling after 15 minutes for new files that match the criteria
  // leave out this to just have the stream end when the data has been
  // processed
  retry: 15*60*1000
};

papertrailStream(opts)
  .on('data', console.log);

// Prints out papertrail data as stream of parsed POJS objects
/**
{ id: '446059570872516660',
  received_at: '2014-09-09T13:08:31',
  generated_at: '2014-09-09T18:08:31Z',
  source_id: '17193724',
  source_name: 'arthur',
  source_ip: '50.97.129.242',
  facility: 'User',
  severity: 'Notice',
  program: 'cloud.log',
  message: ' <<"expired">>}]!' }

  ...

{ id: '446059574437675015',
  received_at: '2014-09-09T13:08:32',
  generated_at: '2014-09-09T18:08:32Z',
  source_id: '17193724',
  source_name: 'arthur',
  source_ip: '50.97.129.242',
  facility: 'User',
  severity: 'Notice',
  program: 'cloud.log',
  message: '=INFO REPORT==== 9-Sep-2014::13:08:32 ===' }
**/
```

## API

### papertrails3TailStream(opts)

Returns a new `Readable` Stream that will be the concatentation of all the
objects that match the query.

* `opts` - Configuration options:
  * `auth` - S3 login. NB: As this uses the `aws-sdk` module, if you have your
    credentials in `~/.aws/config` you can leave this option blank.
    * `accessKeyId` - Your S3 Access Key Id
    * `secretAccessKey` - Your S3 Key
  * `query` - the query object
    * `Bucket` - S3 bucket name
    * `Prefix` - S3 Object Prefix (eg. use to list objects from a given folder)
    * `Marker` (optional) - An S3 object to start listing objects from. Useful
      if you don't want to list all the objects in a bucket, but those *after*
      this marker.
    * `from` (optional) - Javascript Date object that is used to return objects
      *older* than this date.
  * `retry` (optional) - Interval in (ms) to keep looking for new files (ie. tail) that
    match the query. Leave this, or set this to `null` to have the stream
    end when it runs out of files. NB: Setting this too low may cause API
    rate limiing issues.

### Events

Several events are emitted which can be useful:

* `papertrails3TailStream.emit('s3-object', s3object)` - emits the bucket and key of each
  object that matches the query before it gets streamed.
* `papertrails3TailStream.emit('s3-retry', cancel)` - emitted every time the polling
  interval occurs. The data of the event is a function that you can call to
  stop the polling process.
