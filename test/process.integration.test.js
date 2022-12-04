const {
    process
} = require('../processor');

describe("Process - End 2 end testing for processing a PQ file from S3", () => {
    // for testing, DEFAULT_BLOCK_SIZE is set to 10 MB.
    test('process-by-row-groups - test file 0 - file with small row group size', async () => {
        const S3_PARAMS = {
            Bucket: 'hatch-downloads/tech-interview',
            Key: 'sample0.parquet'
        };
        let result = await process({s3Params: S3_PARAMS});
        expect(result).toStrictEqual({ averageScore: 0.7177539324030805, numOfRecords: 1000 })
    }, 10000)

    test('process-by-rows - test file 2 - file with large row group size', async () => {
        const S3_PARAMS = {
            Bucket: 'hatch-downloads/tech-interview',
            Key: 'sample2.parquet'
        };
        let result = await process({s3Params: S3_PARAMS});
        expect(result).toStrictEqual({ averageScore: 0.366218241120836, numOfRecords: 131072 })
    }, 300000)

    test('Failure - test file 1 - file is not existing on S3', async () => {
        const S3_PARAMS = {
            Bucket: 'hatch-downloads/tech-interview',
            Key: 'sample1.parquet'
        };
        try {
            let result = await process({s3Params: S3_PARAMS});
        } catch (e) {
            expect(e.message).toEqual("Access Denied")
        }
    }, 3000)
})

