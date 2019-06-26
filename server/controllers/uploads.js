/* globals appRoot */

const mkdirp = require('mkdirp');
const path = require('path');
const fs = require('fs');
// const findRemoveSync = require('find-remove');
// const tempMediaFolder = './tmp/media';
const editorMediaUploadURLPath = '/media/uploads';
const editorMediaUpload = appRoot + '/public/' + editorMediaUploadURLPath;
const Jimp = require('jimp');

// after restart, lets clean old files in temp media folder
// if (globalHelper.isDev)
// 	findRemoveSync(tempMediaFolder, {
// 		age: {
// 			seconds: 86400
// 		},
// 		maxLevel: 1
// 	});

exports.uploadImage = (req, res) => {
	const file = req.file;
	const { name = file.originalname, folder } = req.body;
	const ext = path.extname(file.originalname).toLowerCase();

	if (ext && !/jpg|png|jpeg/i.test(ext)) {
		return res.status(422).send(JSON.stringify(new Error('JPG, JPEG or PNG only')));
	}

	const savePath = editorMediaUpload + '/www/';
	const sendPath = editorMediaUploadURLPath + '/www/';
	mkdirp.sync(savePath);

	const saveName =
		folder !== 'undefined' ? `${folder}/${replaceSpaces(name)}` : replaceSpaces(name);
	const saveFilePath = path.join(savePath, saveName);
	// let randomName =
	// 	Date.now().toString(36) +
	// 	Math.random()
	// 		.toString(36)
	// 		.substr(2, 5) +
	// 	ext;

	Jimp.read(file.buffer)
		.then(function(lenna) {
			var origImageDim = { width: lenna.bitmap.width, height: lenna.bitmap.height };
			var dimensions = calculateImageDimensions(origImageDim.width, origImageDim.height, 1000, 800);
			lenna
				.cover(dimensions.width, dimensions.height) // resize
				.quality(80) // set JPEG quality
				.write(saveFilePath, function() {
					console.log('uploaded file saved to ', saveFilePath);
					res.json({
						url: sendPath + saveName
					});
				}); // save image
		})
		.catch(function(err) {
			return res.status(422).send(JSON.stringify(err));
		});
};

exports.deleteImage = (req, res) => {
	const fileToDelete = appRoot + '/public/' + req.query.file;
	fs.unlink(path.join(fileToDelete), function(err) {
		if (err) {
			return res.status(422).send(JSON.stringify(err));
		}
		return res.redirect('/admin/upload');
	});
};

function calculateImageDimensions(width, height, maxWidth, maxHeight) {
	// calculate the width and height, constraining the proportions
	if (width > height) {
		if (width > maxWidth) {
			height = Math.round((height *= maxWidth / width));
			width = maxWidth;
		}
	} else {
		if (height > maxHeight) {
			width = Math.round((width *= maxHeight / height));
			height = maxHeight;
		}
	}
	return { width: width, height: height };
}

function replaceSpaces(name) {
	return name.replace(/ /g, '_');
}
