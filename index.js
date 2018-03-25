var mongoose = require('mongoose');
var gridfsLockingStream = require('gridfs-locking-stream');
var fs = require('file-system');
var path = require('path');
var async = require('async');
var mongodb = require('mongodb');


function gridFS(mongoose) {

    var db = mongoose.connection;
    var gfs = gridfsLockingStream(mongoose.connection.db, mongoose.mongo);

    db.on('open', function (err) {
        if (err) throw err;
        console.log("connected correctly to gridfsEasy");
    });

    //handle the error event
    db.on('error', console.error.bind(console, 'connection error:'));
    var self = this;

    this.putFile = function (path, name, callback) {
        try {
            if (typeof path == 'undefined') throw '(path) of the image is undefined in (putFile) function';
            if (typeof name == 'undefined') throw '(name) of the image is undefined in (putFile) function';
            // if (typeof extension == 'undefined') throw '(extension) of the image is undefined in (putFile) function';
            gfs.createWriteStream(
                {filename: name},
                function (err, writestream) {
                    if (err) callback(err, null);
                    else {
                        if (writestream) {
                            fs.createReadStream(path).pipe(writestream);

                            writestream.on('close', function (file) {
                                callback(null, file);
                            });
                        }
                    }
                });
        }
        catch (err) {
            var error = {};
            error.message = err;
            error.status = 27017;
            callback(error, null);
        }
    };
    this.getInfoById = function (id, callback) {
        //since we cannot get a file single file info by id, we get all the files' info
        //but we just send the file the user has been looking for
        try {
            if (typeof id == 'undefined') throw '(id) of the image is undefined in (getInfoById) function';
            var ObjectID = mongodb.ObjectId;
            var o_id = new ObjectID(id);
            console.log('residam man');
            db.collection('fs.files').findOne({_id: o_id}, function (err, Doc) {

                if (err) callback(err, null);
                else if (Doc == null) callback('File Not Found!', null);
                else callback(null, Doc);
            });
        }
        catch (err) {
            var error = {};
            error.message = err;
            error.status = 27017;
            callback(error, null);
        }
    };
    this.getImageById = function (id, callback) {
        try {
            if (typeof id == 'undefined') throw '(id) of the image is undefined in (getFileById) function';
            var imgExtension = '';

            //get the image extension
            async.eachSeries([id], function (id, next) {
                self.getInfoById(id, function (err, Doc) {
                        if (err) callback(err, null);
                        else {
                            imgExtension = path.extname(Doc.filename);
                            next();
                        }
                    }
                );
            }, function (err) {
                if (err) callback(err, null);
                else {
                    gfs.createReadStream({_id: id},
                        function (err, readStream) {
                            if (err) callback(err, null);
                            else {
                                if (readStream) {
                                    var data = [];
                                    readStream.on('data', function (chunk) {
                                        data.push(chunk);
                                    });
                                    readStream.on('end', function () {
                                        data = Buffer.concat(data);
                                        switch (imgExtension) {
                                            case '.svg':
                                                var img = 'data:image/svg+xml;base64,' + Buffer(data).toString('base64');
                                                break;
                                            case '.png':
                                                var img = 'data:image/png;base64,' + Buffer(data).toString('base64');
                                                break;
                                            case '.jpg':
                                                var img = 'data:image/jpg;base64,' + Buffer(data).toString('base64');
                                                break;
                                            case '.gif':
                                                var img = 'data:image/gif;base64,' + Buffer(data).toString('base64');
                                            default:
                                                console.log('default case has been executed');
                                        }
                                        callback(null, img);
                                    })
                                }
                            }
                        });
                }
            });
        }
        catch (err) {
            var error = {};
            error.message = err;
            error.status = 27017;
            callback(error, null);
        }
    };
    this.getBase64ById = function (id, callback) {
        try {
            if (typeof id == 'undefined') throw '(id) of the file is undefined in (getBse64ById) function';
            gfs.createReadStream({_id: id},
                function (err, readStream) {
                    if (err) callback(err, null);
                    else {
                        if (readStream) {
                            var data = [];
                            readStream.on('data', function (chunk) {
                                data.push(chunk);
                            });
                            readStream.on('end', function () {
                                data = Buffer.concat(data);
                                var Base64 = Buffer(data).toString('base64');
                                callback(null, Base64);
                            })
                        }
                    }
                });
        }
        catch (err) {
            var error = {};
            error.message = err;
            error.status = 27017;
            callback(error, null);
        }
    };
    this.getAllByName = function (filename, callback) {
        try {
            if (typeof filename == 'undefined') throw '(filename) of the image is undefined in (getFileByName) function';
            gfs.files.find({filename: filename}).toArray(function (err, files) {
                if (err) callback(err, null);
                else {
                    if (files) {
                        callback(null, files);
                    }
                }
            })
        }
        catch (err) {
            var error = {};
            error.message = err;
            error.status = 27017;
            callback(error, null);
        }
    };
    this.removeFile = function (id, callback) {
        try {
            if (typeof id == 'undefined') throw '(id) of the image is undefined in (removeFile) function';
            gfs.remove({_id: id}, function (err, result) {
                if (err) callback(err, null);
                else if (result) callback(null, result);
            });
        }
        catch (err) {
            var error = {};
            error.message = err;
            error.status = 27017;
            callback(error, null);
        }
    };
    this.removeAll = function (callback) {

        db.collection('fs.files').find({}).toArray(function (err, files) {
            async.eachSeries(files, function (file, next) {
                self.removeFile(file._id, function (err, result) {
                    if (err) callback(err, null);
                    else next();
                });
            }, function (err) {
                if (err) callback(err, null);
                else callback(null, 'All files deleted successfully');
            })
        });
    };
    this.existFile = function (id, callback) {
        gfs.exist({_id: id}, function (err, found) {
            if (err) callback(err, null);
            else callback(null, found);
        });
    };
    this.populateImage = function (doc, callback) {
        //Warning: the doc must have two fields: (imgId) and (imgBase64)
        try {
            console.log('residam');
            if (typeof doc.imgId == 'undefined') throw '(doc.imgId) of the image is undefined in (populateImage) function';
            if (typeof doc.imgBase64 == 'undefined') throw '(doc.imgBase64) of the image is undefined in (populateImage) function';
            self.getFileById(doc.imgId, function (err, img) {
                if (err) callback(err, null);
                else {
                    doc.set('imgBase64', img);
                    callback(null, doc);
                }

            });
        }
        catch (err) {
            var error = {};
            error.message = err;
            error.status = 27017;
            callback(error, null);
        }
    };
    this.populateImages = function (docArray, callback) {
        try {
            if (typeof docArray == 'undefined') throw '(docArray) is undefined in (populateImages) function';
            var updatedDocs = [];
            async.eachSeries(docArray, function (doc, next) {
                self.populateImage(doc, function (err, updatedDoc) {
                    if (err) callback(err, null);
                    else {
                        updatedDocs.push(updatedDoc);
                        next();
                    }
                })
            }, function (err) {
                if (err) callback(err, null);
                else callback(null, updatedDocs);
            })
        }
        catch (err) {
            var error = {};
            error.message = err;
            error.status = 27017;
            callback(error, null);
        }
    }
}

module.exports = gridFS;
