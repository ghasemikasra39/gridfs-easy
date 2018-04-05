# gridfs-easy [![npm version](https://badge.fury.io/js/gridfs-easy.svg)](https://badge.fury.io/js/gridfs-easy) [![GitHub version](https://badge.fury.io/gh/ghasemikasra39%2Fgridfs-easy.svg)](https://badge.fury.io/gh/ghasemikasra39%2Fgridfs-easy)

> Store your files in mongodb easily

## Installation

```sh
$ npm install --save gridfs-easy
```

## Table of Content
* [Usage](#usage)
* [Methods](#methods)
  * [getBase64ById](#getBase64ById)
  * [getInfoById](#getInfoById)
  * [getAllByName](#getAllByName)
  * [getImageById](#getImageById)
  * [existFile](#existFile)
  * [removeFile](#removeFile)
  * [removeAll](#removeAll)
  * [putFile](#putFile)
  * [populateImage](#populateImage)
  * [populateImages](#populateImages)
* [Tips](#tips)
* [license](#license)
  
  
  
  
## <a name="usage"></a> Usage

<a href="https://www.youtube.com/watch?v=mqZgKL1SdrA&feature=youtu.be"
 target="_blank"><img src="http://i63.tinypic.com/1exu7a.jpg" 
alt="usage" width="50%" border="10" /></a>

Craete a file like **_db.js_**:
```js
//require the gridfs-easy and mongoose
var mongoose = require('mongoose');
var gridfsEasy = require('gridfs-easy');

//establish the connection with mongoose
var dbUri = 'mongodb://serverAddress:portNumber/databaseName';
mongoose.connect(dbUri, {useMongoClient: true});

//export the gridfsEasy so that you can use it everywhere
module.exports = new Promise(function (resolve, reject) {
    
    //make sure you've successfully connected
    mongoose.connection.on('connected', function () {
        
        //initialize the gridfs-easy
        var gfsEasy = new gridfsEasy(mongoose);
        resolve(gfsEasy);
    });
});
```
Require the **_db.js_** wherever you want. (e.g. pictureRouter.js)
```js
var gfsEasy = require('./db').then(function (gfsEasy) {
    //make use of gfsEasy methods (e.g. gfsEasy.getInfoById())
})
```
## <a name="methods"></a> Methods

## <a name="getBase64ById"></a> **getBase64ById** (_id, callback function )
A **base64** format of the file (e.g. picture, video, pdf, etc.) from **fs.files** collection with **_id** will be retrieved: 
```js
pictureRouter.route('/getBase64ById')
        .get(function (req, res, next) {
            gfsEasy.getBase64ById('5ab417d36900a33288af587e', function (err, base64) {
                if (err) {}
                
                else { res.json({fileBase64: base64}); }
        })
});
```

## <a name="getInfoById"></a> **getInfoById** (_id, callback function )

A document from **fs.files** collection with **_id** will be retrieved: 
```js
pictureRouter.route('/getInfoById')
        .get(function (req, res, next) {
            gfsEasy.getInfoById('5ab417d36900a33288af587e', function (err, info) {
            if (err) {}
            else {res.json(info);}
        })
});
```
The callback function will be called with **info** of the document:
```js
{
        "_id" : ObjectId("5ab417d36900a33288af587e"),
        "filename" : "pic.png",
        "contentType" : "binary/octet-stream",
        "length" : 13282,
        "chunkSize" : 261120,
        "uploadDate" : ISODate("2018-03-22T20:53:40.026Z"),
        "aliases" : null,
        "metadata" : null,
        "md5" : "f0b8b7ba4ea9b70b4d21ad28f962f0ac"
}
```
## <a name="getAllByName"></a> **getAllByName** (name, callback function )

All documents with the **name** given as the first parameter will be retrieved as an array from the **fs.files** collection:   

```js
pictureRouter.route('/getAllByName')
        .get(function (req, res, next) {
            gfsEasy.getAllByName('pic.png', function (err, docsArray) {
                    if (err) {}
                    else {
                    
                        //send the documents to the client
                        res.json({docs: docsArray});
                    }
                })
});
```

**docs**: 
```js
[
        {
            "_id": "5ab4260c26c6441d946b69e4",
            "filename": "pic.png",
            "contentType": "binary/octet-stream",
            "length": 43630,
            "chunkSize": 261120,
            "uploadDate": "2018-03-22T21:54:20.937Z",
            "aliases": null,
            "metadata": null,
            "md5": "2830695ace2df8a15d3479c432af9f88"
        },
        {
            "_id": "5ab427a726c6441d946b69e6",
            "filename": "pic.png",
            "contentType": "binary/octet-stream",
            "length": 43630,
            "chunkSize": 261120,
            "uploadDate": "2018-03-22T22:01:11.637Z",
            "aliases": null,
            "metadata": null,
            "md5": "2830695ace2df8a15d3479c432af9f88"
        }
]
```

## <a name="getImageById"></a> **getImageById** (_id, callback function )

A **base64** format of the image plus the corresponding **data URI scheme** (e.g. data:image/png;base64,) of a file from **fs.files** collection with **_id** will be retrieved: 
```js
pictureRouter.route('/getImageById')
        .get(function (req, res, next) {
            gfsEasy.getImageById('5ab417d36900a33288af587e', function (err, base64) {
                if (err) {}
                
                    //send the image to the client 
                    // make use of 'image' in HTML( e.g. <img  src={{image}}> )
                else { res.json({image: base64}); }
        })
});
```

## <a name="existFile"></a> **existFile** (_id, callback function )

Check whether a file with **_id** exists in **fs.files** collection:
```js

gfsEasy.existFile('5ab417d36900a33288af587e', function (err, result) {
    if (err) {}
    else {
              //result is true if file exists, false otherwise
              console.log(result) 
         }
})
```

## <a name="removeFile"></a> **removeFile** (_id, callback function )

Remove a file with **_id** from **fs.files** collection:

```js

gfsEasy.removeFile('5ab417d36900a33288af587e', function (err, result) {
    if (err) {}
    else {
            // result is true if file is removed successfully, false otherwise
            console.log(result);
         }
})

```

## <a name="removeAll"></a> **removeAll** (callback function )

Remove all files from **fs.files** collection:

```js

gfsEasy.removeAll(function (err, result) {
    if (err) {}
    else {
            // result is 'All files deleted successfully' if all files are removed successfully
            console.log(result);
         }
})
```
## <a name="putFile"></a>  **putFile** (path, name, callback function )

Store a file in the **fs.files** collection. Here [**ng-file-upload**](https://www.npmjs.com/package/ng-file-upload)  is used on the client side to send the file to the server (some tips are provided [here](#tips)).

Don't forget to use  [**connect-multiparty**](https://www.npmjs.com/package/connect-multiparty) as a middleware:
```js
pictureRouter.route('/putFile')
        .post(multipartMiddleware, function (req, res, next) {
            gfsEasy.putFile(req.files.file.path,
                req.files.file.name,
                function (err, file) {
                    if (err) next(err);
                    res.json(file);
                })
        });
```

## <a name="populateImage"></a>  **populateImage** (document, callback function )

Your document must have two fields : **imgId** and **imgBase64**.

Take this for instance. The document of a user:
```js
{
        "_id" : ObjectId("59a9c78d7d8818260ccd753c"),
        "name" : "kasra",
        "age" : 22,
        "address": "some address",
        "imgId" : ObjectId("5ab4260c26c6441d946b69e4"),
        "imgBase64" : "empty"
}
```

The document of a picture: ( Remember that all of your pictures are stored in **fs.files** collection. )

```js
{
        "_id": "5ab4260c26c6441d946b69e4",
        "filename": "user1.png",
        "contentType": "binary/octet-stream",
        "length": 43630,
        "chunkSize": 261120,
        "uploadDate": "2018-03-22T21:54:20.937Z",
        "aliases": null,
        "metadata": null,
        "md5": "2830695ace2df8a15d3479c432af9f88"
}
```
Your document (in our example the **user** document) must hold the id of the picture under the **imgId** field 


![populateImage](http://i68.tinypic.com/2ntgzlk.jpg)

Once the **populateImage** function is called with the **user** document as the first parameter, the **imgBase64** field will be populated with the base64 format of the corresponding picture and the updated user document will be available in the callback function:

The **updatedUserDoc**: 
```js
{
        "_id" : ObjectId("59a9c78d7d8818260ccd753c"),
        "name" : "kasra",
        "age" : 22,
        "address": "some address",
        "imgId" : ObjectId("5ab4260c26c6441d946b69e4"),
        "imgBase64" : "data:image/png;base64,iVBORw0KGgoA..." <------
}
```

The sample code :

```js
userRouter.route('/user')
    .get(function (req, res, next) {
                gfsEasy.populateImage(userDoc, function (err, updatedUserDoc) {
                    if (err) {}
                    else {
                        res.json(updatedUserDoc);
                    }
                });
    });
```

## <a name="populateImages"></a> **populateImages** (documents array, callback function )

Populate imgBase64 field in documents in the given array:

```js
userRouter.route('/user')
    .get(function (req, res, next) {
                gfsEasy.populateImages(userDocArray, function (err, updatedUserDocArray) {
                    if (err) {}
                    else {
                        res.json(updatedUserDocArray);
                    }
                });
    });
```

## <a name="tips"></a> Tips (Client side)

As mentioned above, you can use **ng-file-upload** to upload your files:

We've created two buttons, one for choosing a file and the other for submitting:

**HTML**:
```html
<form name="Subform">
            <div class="button btn btn-success" ngf-select ng-model="file" name="file" ngf-pattern="'*/*'"
                 ngf-accept="'*/*'" ngf-max-size="20MB" ngf-min-height="100">Select
            </div>
            <button class="btn btn-info" type="submit" ng-click="submit()">putFile</button>
</form>
```

Assume that the controller below controls the form in our view: 

**Controller**:

```js
$scope.submit = function () {
    fileUpload.uploadFile($scope.file);
};
```
We have created a function which receives the file and uploads it using **Upload** (**ng-file-upload**) to the server. Please visit [**ng-file-upload**](https://www.npmjs.com/package/ng-file-upload).

**_fileUpload_ Service**:
```js
this.uploadFile = function (file) {
        Upload.upload({
          url: 'http://localhost:3000/gfs/putFile',
          data: {file: file}
        }).then(function (resp) {
        }, function (resp) {
          console.log('Error status: ' + resp.status);
        }, function (evt) {
          var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
        });
      };
```
 
## <a name="license"></a> License

MIT © [Kasra Ghasemi](https://github.com/ghasemikasra39/gridfs-easy)
