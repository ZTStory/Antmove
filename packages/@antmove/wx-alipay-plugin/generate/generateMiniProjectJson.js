const path = require('path');
const fs = require('fs-extra');

module.exports = function (output) {
    const jsonStr = `{
        "component2": true
    }`
    let miniPath = path.join(output, 'mini.project.json');
    fs.outputFile(miniPath, jsonStr);
}