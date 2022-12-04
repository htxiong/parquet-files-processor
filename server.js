const express = require('express');
const AWS = require('aws-sdk');
const { config } = require('./config');


const port = 3020;

const app = express();

app.get('/download', function(req, res, next){
    const fileKey = req.query['fileKey'] || config.S3_PARAMS.Key || 'sample0.parquet';
    console.log('Start to download file', fileKey);
    AWS.config.update(config.S3_CREDENTIALS);
    const s3 = new AWS.S3();
    const options = {
        Bucket: config.S3_PARAMS.Bucket || 'hatch-downloads/tech-interview',
        Key: fileKey
    };

    res.attachment(fileKey);
    const fileStream = s3.getObject(options).createReadStream();
    console.log('Downloading file by streaming.', fileKey);
    fileStream.pipe(res);
});

app.listen(port, () => {
    console.log('Server listening on the port   ', port);
})