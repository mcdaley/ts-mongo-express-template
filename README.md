# TypeScript App w/ MongoDB & Express
Example app template for building TypeScript app with MongoDB and Express

## Initialize the Project

```bash
$ mkdir ${project-name}
$ cd    ${project-name}
$ npm   init -y
$ touch .gitignore
$ vi    .gitignore
```

Add the following to the __.gitignore__ file.

```bash
# -------------------------------------------------------------------
# .gitignore
# -------------------------------------------------------------------
node_modules/
dist/
logs/
tmp/
.idea
.env
cookie*.txt
```

## Setup Express w/ TypeScript

```bash
$ npm install --save express
$ npm install --save-dev typescript ts-node @types/node @types/express
```

### Configure TypeScript
Initialize typescript and create the __tsconfig.json__ file by running the following command:

```bash
$ npx tsc --init
```

Now, edit the __tsconfig.json__ file w/ the following parameters:

```json
{
  "compilerOptions": {
    /* Visit https://aka.ms/tsconfig.json to read more about this file */
    "target":           "es6",
    "module":           "commonjs",
    "sourceMap":        true,
    "baseUrl":          "./",
    "outDir":           "dist",
    "strict":           true, 
    "esModuleInterop":  true,
    "noImplicitAny":    true,
    "moduleResolution": "node",
    
    /* Advanced Options */
    "skipLibCheck":     true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"]
}
```

### Add Nodemon
Nodemon is used to automatically restart the app whenever a change is made to a file and it greatly speeds up development.

```bash
$ npm install --save-dev nodemon
```

I found that it works better if I configure nodemon by adding a __nodemon.json__ file in the project root. Below is the __nodemon.json__.

```json
{
  "restartable":  "rs",
  "ignore":       [".git", "node_modules/", "dist/", "coverage/"],
  "watch":        ["src/"],
  "execMap": {
    "ts": "node -r ts-node/register"
  },
  "env": {
    "NODE_ENV":   "development"
  },
  "ext":          "js,json,ts"
}
```

### Setup Scripts in package.json
Add the following script commands to the __package.json__ file that will be used to run the app in the different environments, where the NODE_ENV will be defined later in the document.

```json
"scripts": {
    "build": "tsc",
    "clean": "cd ./dist; rm -r *; cd ..",
    "dev":   "export NODE_ENV=development; nodemon --config nodemon.json ./src/index.ts",
    "dev:debug": "export NODE_ENV=development; nodemon --config nodemon.json --inspect-brk src/index.ts",
    "start": "export NODE_ENV=development; tsc && node ./dist/index.js",
    "test": "export NODE_ENV=test; jest"
  },
```

### Verify the Basic Express Setup
Verify that everything is working correctly by starting a simple express server by creating and running an __./src/index.ts__ file using the npm build, clean, dev, and start commands.

## Express Add Ons
Add the following modules for adding more advanced functionality to our Express server.

```bash
$ npm install --save cors app-root-path dotenv winston express-winston
$ npm install --save-dev @types/cors @types/app-root-path @types/dotenv
$ npm install --save-dev @types/winston
```

See the __./src/index.ts, ./src/config/config.ts, .env, and ./src/config/winston.ts__ to see how to use the just installed modules.

## MongoDB
For the framework, I'm going to use the native mongodb driver instead of mongoose.js because I am also trying to learn more about MongoDB. Install the native mongodb drivers:

```bash
$ npm install --save mongodb
$ npm install --save-dev @types/mongodb
```

### Configure MongoDB Connection

## Architecture Overview
The typical API flow is to perform a CRUD operation on the data, which returns data and then sending a response to the client. In the case the server also needs to make requests to another API then it needs to build the request from either user input or data returned from a CRUD operation.

### DAOs
The DAOs are responsible for CRUD operations and only return the data for the
request or an error.

### Message/Response/Request Builders
The Message Builders are responsible for building the Response/Request JSON objects for the APIs using the data returned by the DAOs.

## API Message Format
__TODO__
I NEED TO DEFINE A STANDARD MESSAGE FORMAT FOR THE CRUD OPERATIONS AND ERRORS, SO THAT I CAN CREATE APIS RIGHT OUT OF THE BOX. LOOK AT THE GOOGLE DOCS AND OTHER EXAMPLE APIS FOR BEST PRACTICES.

So, there are 2 types of APIs
1.) Request - Client sends a request for data
2.) Reponse - Server sneds a response

### DAO Responses
The DAO methods should return just the data or send an error message with the Http status and a message that can be forwarded in the response. The CRUD routes will handle building the response message.

### Error Handling
I should return an error in the DAO with the HTTP status and a message that can be forwarded in the routes.

```json
{
  "code":     "${Numeric Error Code}",
  "message":  "${Error Message}"
}
```

### Template
#### Request by Id
```json
  "requestHeader": {
    "requestTimestamp": {
      "epochMillis":  "${epochMilliseconds}"
    }
    "transactionId":  "",
  },
  "id": "${value-id}"
```

#### Response
```json
{
  "responseHeader": {
    "responseTimestamp": {
      "epochMillis":  "${epochMilliseconds}"
    }
  },
  "result": {
    "field-1": "value-1",
    "array-1": [
      "id-1": "array-field-1",
      "id-2": "array-field-2",
      ...
    ]
  }
}
```

### GET /documents/:id
Fetch a single document and return the document to the requestor.

#### Request
NA - If use the :id in the URL

If I do not follow the REST guidelines and get a URL like __getDocumentDetails__ then I could add the following in the request:

```json
{
  "requestHeader": {
    "requestTimestamp": {
      "epochMillis":  "${epochMilliseconds}"
    }
    "requestId":        "abcdef123456"
  },
  "requestBody": {
    "id": "${documentId}"
  }
}
```

OR,

```json
{
  "requestHeader": {
    "requestTimestamp": "${epochmillis}",
    "requestId":        "abcdef123456"
  },
  "id": "${documentId}"
}
```

#### Response
```json
{
  "responseHeader": {
    "responseTimestamp": {
      "epochMillis":  "${epochMilliseconds}"
    }
  },
  "result": {
    "field-1":   "value-1",
    "field-2":   "value-2"
  }
}
```

### GET /documents
Get a list of all documents that can be filtered by setting a limit and an offset for paging. The response contains a list of the documents and the total count of all the documents.

#### Request
NA - If I add the query parameters to the URL

Otherwise,

```json
{
  "requestHeader": {
    "requestTimestamp": {
      "epochMillis":  "${epochMilliseconds}"
    }
  },
  "filters": {
    "page":       "${page}",
    "perPage":    "${documents-per-page}",
    "sort": {
      "field":    "${sort-field}",
      "order":    "ascending||descending"
    },
    "startDate": {
      "epochMillis":  "${epochMilliseconds}"
    },
    "endDate": {
      "epochMillis":  "${epochMilliseconds}"
    }
  }
}
```

#### Response
```json
  "responseHeader": {
    "responseTimestamp": {
      "epochMillis":  "${epochMilliseconds}"
    }
  },
  "result": {
    "documents": [
      "documentId": {"${document}"},
      "documentId": {"${document}"},
      "documentId": {"${document}"},
      ...
    ],
    "totalDocuments": "${totalDocuments}"
  }
```

### POST /documents
Create a new document and return the document w/ its id.

#### Request
```json
  "requestHeader": {
    "requestTimestamp": {
      "epochMillis":  "${epochMilliseconds}"
    }
    "requestId": "${unique-request-id}"
  },
  "request": {
    "title":    "",
    "author":   "",
    "summary":  ""
  }
```

#### Response
```json
  "responseHeader": {
    "responseTimestamp": {
      "epochMillis":  "${epochMilliseconds}"
    }
  },
  "result": {
    "document": {
      "id":       "",
      "title":    "",
      "author":   "",
      "summary":  ""
    }
  }
```

### PUT /documents/:id
Update a single document that is specified by the document ID and return the updated document.

#### Request
```json
  "requestHeader": {
    "requestTimestamp": {
      "epochMillis":  "${epochMilliseconds}"
    }
    "requestId": "${unique-request-id}"
  },
  "request": {
    "title":    "",
    "author":   "",
    "summary":  ""
  }
```

#### Response
```json
  "responseHeader": {
    "responseTimestamp": {
      "epochMillis":  "${epochMilliseconds}"
    }
  },
  "result": {
    "document": {
      "id":       "",
      "title":    "",
      "author":   "",
      "summary":  ""
    }
  }
```

### DELETE /documents/:id
```json
  "header": {

  },
  "body": {
    
  }
```