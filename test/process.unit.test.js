const parquet = require("parquetjs-lite");
const {
    processByRows,
    processByRowGroups,
    processLargeSizeRowGroup,
    processSmallSizeRowGroup
} = require('../processor');

describe("processByRows - fetch and process PQ file by rows", () => {
    test('should be able to calculate average score if the column "score" are found', async () => {
        const filePath = './files/sample0.parquet';
        const reader = await parquet.ParquetReader.openFile(filePath);

        let result = await processByRows(reader, ['score']);
        expect(result).toStrictEqual({ averageScore: 0.7177539324030805, numOfRecords: 1000 })
    }, 3000)

    test('should be able to calculate average score if the column "score" are found, even other columns are NOT found', async () => {
        const filePath = './files/sample0.parquet';
        const reader = await parquet.ParquetReader.openFile(filePath);

        let result = await processByRows(reader, ['score', 'amount']);
        expect(result).toStrictEqual({ averageScore: 0.7177539324030805, numOfRecords: 1000 })
    }, 3000)

    test('should be failed to calculate average score if the column "score" is found', async () => {
        const filePath = './files/userdata.parquet';
        const reader = await parquet.ParquetReader.openFile(filePath);

        let result = await processByRows(reader, ['score']);
        expect(result).toStrictEqual({ averageScore: 0, numOfRecords: 0 })
    }, 3000)

    test('should be failed if reader is not created', async () => {
        const reader = undefined;
        try {
            await processByRows(reader, ['score']);
        } catch (e) {
            expect(e.message).toStrictEqual('Cannot read properties of undefined (reading \'getCursor\')')
        }

    }, 3000)
})

describe("processByRowGroups - fetch and process PQ file by row groups", () => {
    test('should be able to calculate average score if the column "score" are found', async () => {
        const filePath = './files/sample0.parquet';
        const reader = await parquet.ParquetReader.openFile(filePath);

        let result = await processByRowGroups(reader, ['score']);
        expect(result).toStrictEqual({ averageScore: 0.7177539324030805, numOfRecords: 1000 })
    }, 3000)

    test('should be able to fetch and process file if the column score is found, even other columns are NOT found', async () => {
        const filePath = './files/sample0.parquet';
        const reader = await parquet.ParquetReader.openFile(filePath);

        let result = await processByRowGroups(reader, ['score', 'amount']);
        expect(result).toStrictEqual({ averageScore: 0.7177539324030805, numOfRecords: 1000 })
    }, 3000)

    test('should be failed to fetch and process file if the give columns are NOT found', async () => {
        const filePath = './files/userdata.parquet';
        const reader = await parquet.ParquetReader.openFile(filePath);

        let result = await processByRowGroups(reader, ['score', 'amount']);
        expect(result).toStrictEqual({ averageScore: 0, numOfRecords: 0 })
    }, 3000)

    test('should be failed if reader is not created', async () => {
        const reader = undefined;
        try {
            await processByRowGroups(reader, ['score']);
        } catch (e) {
            expect(e.message).toStrictEqual('Cannot read properties of undefined (reading \'metadata\')')
        }

    }, 3000)
})

describe("processLargeSizeRowGroup - calculate total score of a row groups", () => {
    test('should be able to calculate total score', async () => {
        const filePath = './files/sample0.parquet';
        const reader = await parquet.ParquetReader.openFile(filePath);
        const cursor = reader.getCursor(['score']);
        const rowGroup = await cursor.nextRowGroup();
        const result = processLargeSizeRowGroup(rowGroup);
        expect(result).toStrictEqual({ numOfRecords: 1000, "total": 717.7539324030805 })
    }, 3000)

    test('should be able to calculate total score and return 0 if give row group is empty', async () => {
        const result = processLargeSizeRowGroup([]);
        expect(result).toStrictEqual({ numOfRecords: 0, "total": 0 })
    }, 1000)

    test('should be failed to calculate total score if give row group is not a Array', async () => {
        try {
            processLargeSizeRowGroup({});
        } catch (e) {
            expect(e.message).toStrictEqual('rowGroup.shift is not a function')
        }
    }, 1000)
})

describe("processSmallSizeRowGroup - calculate total score of a row groups", () => {
    test('should be able to calculate total score', async () => {
        const filePath = './files/sample0.parquet';
        const reader = await parquet.ParquetReader.openFile(filePath);
        const cursor = reader.getCursor(['score']);
        const rowGroup = await cursor.nextRowGroup();
        const result = processSmallSizeRowGroup(rowGroup);
        expect(result).toStrictEqual({ numOfRecords: 1000, "total": 717.7539324030805 })
    }, 3000)

    test('should be able to calculate total score and return 0 if give row group is empty', async () => {
        const result = processSmallSizeRowGroup([]);
        expect(result).toStrictEqual({ numOfRecords: 0, "total": 0 })
    }, 1000)

    test('should be failed to calculate total score if give row group is not a Array', async () => {
        try {
            processSmallSizeRowGroup({});
        } catch (e) {
            expect(e.message).toStrictEqual('rowGroup.map is not a function')
        }
    }, 1000)
})
