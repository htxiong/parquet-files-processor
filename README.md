# parquet-files-processor
A simple Nodejs App to process parquet files stored on S3

## Patch required for module parquetjs-lite
There are two small patched i created for *parquetjs-lite* to be able to work with the give testing files. 
I will fix it properly and create a pull request.

## Getting started

#### Create your local .env file, add those 4 rows to it and put it to project root.  
``` 
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
AWS_ACCESS_KEY_SECRET=YOUR_AWS_ACCESS_KEY_SECRET
S3_BUCKET=YOUR_AWS_S3_BUCKET
S3_FILE_KEY=YOUR_AWS_S3_FILE_KEY
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