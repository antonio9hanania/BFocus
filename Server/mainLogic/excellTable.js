var excel = require('excel4node');
var fs = require('fs');

function createExcellTable(req) {
    return new Promise(function(resolve, reject) {
        var result = {"message" : '', "filePath": ''};
        var id = req.headers.id;
        var headerTable = req.body.headerData;
        var data = req.body.data;

        data.unshift(headerTable);

        var workbook = new excel.Workbook();
        var worksheet = workbook.addWorksheet('Sheet 1');

        data.forEach(function (value1, i) {
            value1.forEach(function (value2, j) {
                worksheet.cell(i + 1, j + 1).string(value2.toString());
            });
        });
    
        var filePath = './lecturersExportReq/' + id +'.xlsx';
        workbook.write(filePath, (err) => {
            if(err) {
                result.message = "Couldn't create file due:" + err;
                reject(result);   
            }
            else {
                fs.exists(filePath, (exists) => {
                    if(exists) {
                        result.message = " File created successfully.";
                        result.filePath = filePath;
                        resolve(result);
                    }
                    else {
                        result.message = "Couldn't find file in the path.";
                        reject(result);  
                    } 
                });
            }            
        });
    });
}

function downloadExcelFile(req, res) {
    var filepath = req.query['filePath'];
    fs.exists(filepath, (exists) => {
        if(exists) {
            console.log("files exists in path: ", filepath);
            res.download(filepath, (err) => {
                if(err) {
                    console.log("some error occured during download: " + err);
                }
                fs.unlink(filepath, (err) => {
                    if(err) {
                        console.log("some error occured during delete file: " + err); 
                    }
                    else {
                        console.log('path/file.txt was deleted');
                    }
                });
            });        
        }
        else {
            var messsage = "Invalid file path give file isn't exists" ;
            console.log(messsage);
            res.send(messsage);
        }
    });
}

function removeExcelFile(filePath) {
    var message;
     fs.exists(filePath, (exists) => {
        if (exists) {
            fs.unlink(filePath, (err) => {
                if(err) {
                    message = "Failed to delete file due: " + err;
                }
                else {
                    message = "File deleted successfully.";
                }
            });
        }
        else {
            message = "File isn' t exists in the server.";
        }

        console.log(message);
        return message;
    });
}

module.exports = {createExcellTable, downloadExcelFile}