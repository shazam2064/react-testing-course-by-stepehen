const fs = require('fs');
const path = require('path');

const deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) {
            throw err;
        }
    });
};

const createFolder = (imagesDir) => {
    if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
    }
};

exports.deleteFile = deleteFile;
exports.createFolder = createFolder;