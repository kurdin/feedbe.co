/* globals appRoot */
const express = require('express');
const app = express.Router();
const passwordless = require('passwordless');
const admins = require('common/config/application').admins;
const admin = require('../controllers/admin');
const multer = require('multer');

const upload = multer({
	storage: multer.memoryStorage()
});
// const tus = require('tus-node-server');
// const tusServer = new tus.Server();

// const imagesUploadsTmp = 'public/uploads/.tmp';
// const imagesUploads = 'public/uploads';

// console.log('appRoot', appRoot);
// console.log('imagesUploadsTmp', imagesUploadsTmp);
// console.log('imagesUploads', imagesUploads);

// tusServer.datastore = new tus.FileStore({
// 	path: imagesUploadsTmp
// });

// tusServer.on(tus.EVENTS.EVENT_UPLOAD_COMPLETE, event => {
// 	const oldPath = `${imagesUploadsTmp}/${event.file.id}`;
// 	const newPath = `${imagesUploads}/${metadataStringToObject(event.file.id).filename}`;

// 	fs.rename(oldPath, newPath, err => {
// 		if (err !== null) console.error(err);
// 		else {
// 			console.log('uploaded file ' + oldPath + ' saved as ' + newPath);
// 		}
// 	});
// });
/* /admin page */
app.use(
	passwordless.restricted({
		failureRedirect: '/login',
		originField: 'origin'
	})
);

app.get('/upload', adminCheck, admin.upload);

app.post('/uploads', upload.single('file'), require('../controllers/uploads').uploadImage);
app.get('/uploads/delete', require('../controllers/uploads').deleteImage);

app.get('/*', adminCheck, admin.index);

function adminCheck(req, res, next) {
	if (!admins.includes(req.user)) {
		return res.render('restricted', { user: req.user });
	} else next();
}

module.exports = app;
