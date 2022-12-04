const AWS = require('aws-sdk');
const parquet = require('parquetjs-lite');
const { config } = require('./config');


const S3_CREDENTIALS = config.S3_CREDENTIALS;
const S3_PARAMS = config.S3_PARAMS;
const K_UNIT = 1024;

// The block size to determine should a row group be fetched in one goal or row by row.
// default to 32 MB (10 MB for testing), can be larger, but you should make it a right size based on your RAM.
const DEFAULT_BLOCK_SIZE = (config.DEFAULT_BLOCK_SIZE || 32) * K_UNIT * K_UNIT;

const processSmallSizeRowGroup = (rowGroup = []) => {
    try {
        const result = {
            numOfRecords: 0,
            total: 0
        };

        result.numOfRecords = rowGroup.length;
        const rowGroupScores = rowGroup.map(record => {
            return  parseFloat(record.score);
        });
        const rowGroupTotal = rowGroupScores.reduce((partialSum, a) => partialSum + a, 0);
        result.total += rowGroupTotal;
        console.log('Number of rows have been processed is ', result.numOfRecords)

        return result;
    } catch (e) {
        throw e;
    }
}

const processLargeSizeRowGroup = (rowGroup = []) => {
    try {
        const result = {
            numOfRecords: 0,
            total: 0
        };

        let record;
        while (record = rowGroup.shift()) {
            if (!record.score) {
                break;
            }
            result.total += parseFloat(record.score);
            result.numOfRecords ++;
            console.log('Number of rows have been processed is ', result.numOfRecords)
        }

        return result;
    } catch (e) {
        throw e;
    }
}

const processRowGroup = async (cursor) => {
    try {
        const rowGroupIndex = cursor.rowGroupIndex;
        console.log('Start to process PQ row group with index ', rowGroupIndex)

        const rowGroup = await cursor.nextRowGroup();
        const rowGroupSize = rowGroup && rowGroup.length || 0;

        let result;
        if (rowGroupSize === 0) {
            result = {
                numOfRecords: 0,
                total: 0
            };
        } else if (rowGroupSize > 10000) {
            result = processLargeSizeRowGroup(rowGroup)
        } else {
            result = processSmallSizeRowGroup(rowGroup);
        }

        console.log('Complete to process PQ row group with index ', rowGroupIndex)
        return result;
    } catch (e) {
        throw e;
    }
}

// Fetch and process file by row groups and in parallel, for files with small block size (size of row group)
const processByRowGroups = async (reader, columns = ['score']) => {
    try {
        console.log('Start to process parquet file by row groups.')
        const numOfRowGroups = reader.metadata.row_groups.length;
        console.log('The number of RowGroups found from the PQ file is ', numOfRowGroups);

        const cursors = [];
        for (let index = 0; index < numOfRowGroups; index ++) {
            const cursor = reader.getCursor(columns);
            cursor.rowGroupIndex = index;
            console.log('Create PQ reader cursor for row group with index ', cursor.rowGroupIndex)
            cursors.push(cursor);
        }

        console.log('Start to process parquet file row groups.')
        const rowGroupsProcessingPromises = cursors.map(cursor => processRowGroup(cursor));
        return Promise.all(rowGroupsProcessingPromises).then((results) => {
            const aggregatedResult = results.reduce(
                (accumulator, currentValue) => {
                    accumulator.total += currentValue.total;
                    accumulator.numOfRecords += currentValue.numOfRecords;

                    return accumulator;
                }, {
                    numOfRecords: 0,
                    total: 0
                });

            console.log('Calculate mean of scores.');
            aggregatedResult.averageScore = aggregatedResult.numOfRecords > 0 ? aggregatedResult.total / aggregatedResult.numOfRecords : 0;
            delete aggregatedResult.total;
            console.log('Complete to process parquet file.')
            return aggregatedResult;
        });
    } catch (e) {
        throw e;
    }
}

// Fetch and process file by rows, for files with larger block size (size of row group)
const processByRows = async (reader, columns = ['score']) => {
    try {
        console.log('Start to process parquet file by rows.')
        const result = {
            numOfRecords: 0,
            total: 0
        };

        const cursor = reader.getCursor(columns);
        let record = null;
        while (record = await cursor.next()) {
            if (!record.score) {
                break;
            }
            result.total += parseFloat(record.score);
            result.numOfRecords ++;
            console.log('Number of rows have been processed is ', result.numOfRecords)
        }

        console.log('Calculate mean of scores.');
        result.averageScore = result.numOfRecords > 0 ? result.total / result.numOfRecords : 0;
        delete result.total;
        console.log('Complete to process parquet file.')
        return result;
    } catch (e) {
        throw e;
    }
}

// Read and Process a Parquet file stored on S3 and calculate the average value of score of all records.
const process = async ({
   s3Credentials = S3_CREDENTIALS,
   s3Params = S3_PARAMS
}) => {
    try {
        console.log('Start to read and process parquet file from S3 with config ', JSON.stringify(s3Params));
        const client = new AWS.S3(s3Credentials);
        console.log('Create reader.');
        const reader = await parquet.ParquetReader.openS3(client, s3Params);
        const numOfRowGroups = reader.metadata.row_groups.length;
        if (numOfRowGroups === 0) {
            return { averageScore: 0, numOfRecords: 0 };
        }
        const fileSize = reader.envelopeReader.fileSize;
        const rowGroupSize = fileSize / numOfRowGroups;
        const columns = ['score'] // Fetch score column data only
        let result;
        if (rowGroupSize > DEFAULT_BLOCK_SIZE) {
            result = await processByRows(reader, columns);
        } else {
            result = await processByRowGroups(reader, columns);
        }
        console.log('Close reader.');
        reader.close();

        console.log('Complete to process PQ file with result ', result);
        return result;
    } catch (e) {
        console.error('Failed to process PQ file with error ', e.message);
        throw e;
    }
}


module.exports = {
    process,
    processByRows,
    processByRowGroups,
    processLargeSizeRowGroup,
    processSmallSizeRowGroup
}
