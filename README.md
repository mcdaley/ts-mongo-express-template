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