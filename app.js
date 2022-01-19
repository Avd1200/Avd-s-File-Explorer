//require node modules
const http = require("http");
const url = require("url");
const path = require("path");
const fs = require("fs");

//file imports
const buildBreadCrumb = require("./lib/breadcrumb.js");
const buildMainContent = require("./lib/mainContent.js");
const getMimeType = require("./lib/getMimeType");

//connection settings
const port = process.env.PORT || 3001;

//Project base path: location of your location folder
const staticBasePath = path.join(__dirname, ".", "static");

//Create server
const server = http.createServer((request, response) => {
  //before working with the pathname,you need to decode it
  let pathname = url.parse(request.url, true).pathname;
  //if favicon.ico stop
  if (pathname === "/favicon.ico") {
    return false;
  }

  pathname = decodeURIComponent(pathname);
  //get the corresponding full project path located in the project folder
  const FullStaticPath = path.join(staticBasePath, pathname);

  //Can we find something in full static path?
  //no: Send '404: File not found!'
  if (!fs.existsSync(FullStaticPath)) {
    console.log(`${FullStaticPath} does not exist`);
    response.write("404: File not found!");
    response.end();
    return false;
  }
  //We found something
  //Is it a file or a directory?
  let stats;
  try {
    stats = fs.lstatSync(FullStaticPath);
  } catch (err) {
    console.log(`lstatSync error: ${err}`);
  }

  //It is a directory:
  if (stats.isDirectory()) {
    //get content from a template index.html
    let data = fs.readFileSync(
      path.join(staticBasePath, "project_files/index.html"),
      "utf-8"
    );
    //build the page title
    console.log(pathname);

    let pathElements = pathname.split("/").reverse();
    pathElements = pathElements.filter((element) => element !== "");

    let folderName = pathElements[0];
    if(folderName===undefined){
      folderName = 'Home';
    }
    console.log(folderName);

    //build breadcrumb
    const breadcrumb = buildBreadCrumb(pathname);

    //build table rows
    //(main content)
    const mainContent = buildMainContent(FullStaticPath, pathname);
    //fill the template data with:
    //the page title,breadcrumb and table rows(main content)
    data = data.replace("page_title", folderName);
    data = data.replace("pathname", breadcrumb);
    data = data.replace("mainContent", mainContent);
    //print data to the webpage
    response.statusCode = 200;
    response.write(data);
    return response.end();
  }

  // If it is not a directory but not a file either
  if (!stats.isFile()) {
    response.statusCode = 401;
    response.write("401: Access Denied!");
    console.log("not a file!");
    return response.end();
  }
  
  //Let's get the file extension
  let fileDetails = {};
  fileDetails.extname = path.extname(FullStaticPath);
  console.log(fileDetails.extname);

  //file size
  let stat;
  try {
    stat = fs.statSync(FullStaticPath);
  } catch (err) {
    console.log(`error: ${err}`);
  }
  fileDetails.size = stat.size;

  //get the file mime type and add it to the response header
  getMimeType(fileDetails.extname)
    .then((mime) => {
      //store headers here 
      let head = {};
      let options = {};

      //response status code
      let statusCode  = 200;

      //set "Content-Type " for all file Types
     head['Content-Type'] = mime;

     //get the file size and add it to the response header
     //pdf file?-> display in browser
    if(fileDetails.extname ==='.pdf')
     {
       head['Content-Disposition']='inline';
       //head['Content-Disposition']='attachment;filename=file.pdf';
     }

     //Audio/Video file? -> stream in ranges
     if(RegExp('audio').test(mime) || RegExp('video').test(mime)){
       head['Accept-Range'] = 'bytes';
       const range = request.headers.range;
       console.log(`range: ${range}`);
       if(range){
         //bytes = 5210112-end
         //headers
         //Content-Range
         const start_end = range.replace(/bytes=/,"").split('-');
         const start =parseInt(start_end[0]);
         const end = start_end[1]?parseInt(start_end[1]):fileDetails.size-1;
         
       head['Content-Range'] = `bytes ${start}-${end}/${fileDetails.size}`;
       //Content-Length
       head['Content-Length'] = end-start+1;
       statusCode = 206;
       options = {start,end};
     }
    }
       

       //headers
       //Content-Range

      //reading the files using fs.readfile
    //   fs.promises.readFile(FullStaticPath,'utf-8')
    //   .then(data => {
    //         response.writeHead(statusCode,head);
    //         response.write(data);
    //         return response.end();
    //       }
    //   )
    //   .catch(error=>{
    //     console.log(error);
    //     response.statusCode = 404;
    //     response.write('404: File reading error!');
    //     return response.end();
    //   });
        const fileStream = fs.createReadStream(FullStaticPath,options);

        //Stream Chunks to your response object
        response.writeHead(statusCode,head);
        fileStream.pipe(response);

        //events: close and error
        fileStream.on('close',()=>{
          return response.end();
        })
        fileStream.on('error',error=>{
          console.log(error.code);
          response.statusCode = 404;
          response.write = ('404: FileStream error!');
          return response.end();
        });
      })
     .catch((err) => {
      response.statusCode = 500;
      response.write("500: Internal server error!");
       console.log(`Promise error: ${err}`);
      return response.end();
     });
});

//Listen to client requests on the specific port,the port should be available
server.listen(port, () => {
  console.log(`listening on port: ${port}`);
});
