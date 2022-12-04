const config = ({
    S3_CREDENTIALS: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET
    },
    S3_PARAMS: {
        Bucket: process.env.S3_BUCKET,
        Key:  process.env.S3_FILE_KEY,
    },
    DEFAULT_BLOCK_SIZE: process.env.DEFAULT_BLOCK_SIZE
});

module.exports = {
    config
};
