# parquet-files-processor
A simple Nodejs App to process parquet files stored on S3

## BLOCK SIZE config.
The recommended block size of Parquet file is set to 256 MB [Apache Parquet Configurations](https://parquet.apache.org/docs/file-format/configurations/), in the application its 32 MB, but it can be overwritten by an environment variable.
```
DEFAULT_BLOCK_SIZE
```
For end 2 end performance of data manipulation (write to and read from) parquet files stored on S3, there are several factors you should consider to have a right configuration on sizes.
1. S3 default block size
2. Parquet block size (row group size)
3. RAM of your computing resources for Writer and Reader.
4. File system chunk size - DS team might use hadoop or spark. 

The best configurations should be based on what you have, what your data size is and how do you use it. 

## Patch required for module parquetjs-lite
There are two small patch files created for *parquetjs-lite* to work with the give sample files. 
I will fix it properly and create a pull request. 
You can  apply it by executing command.
``` 
npm run build
 ```

## Getting started

#### Create your local .env file, add those 4 rows to it and put it to project root.  
``` 
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
AWS_ACCESS_KEY_SECRET=YOUR_AWS_ACCESS_KEY_SECRET
S3_BUCKET=YOUR_AWS_S3_BUCKET
S3_FILE_KEY=YOUR_AWS_S3_FILE_KEY
DEFAULT_BLOCK_SIZE=32
```

#### Create your local .env.test file, add those 2 rows to it and put it to project root.
``` 
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
AWS_ACCESS_KEY_SECRET=YOUR_AWS_ACCESS_KEY_SECRET
```

#### Install dependencies:
``` 
npm run pre-build 
```

#### Install dependencies and Apply patch to *parquetjs-lite*
``` 
npm run build
 ```

#### Run tests:
``` 
npm run test 
```

#### Run process for the file configured in .env file
``` 
npm run start
 ```

#### Start Server - have a endpoint to download the test files from S3
``` 
npm run serve 
```