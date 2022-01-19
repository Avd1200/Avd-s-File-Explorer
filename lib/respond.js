//Module imports
const url=require('url');
//File imports


//respond to a request
//Following is function passed to createServer used to create the server
const respond = (request,response) => {
   response.write('response fired!');
   response.end();
//Before working with the pathname you need to decode it

const pathname = url.parse(request.url,true).pathname;
if(pathname === '/favicon.ico'){
   return false;
}
console.log(pathname);
console.log(decodeURIComponent(pathname));
   
//Get the corresponding full static path located in the static folder

//Can we find something in full static path?
//no :send '404: File not found!'
//we found something
//is it a file or directory?
 //it is a diectory:
    //get content from the template 
}

module.exports = respond;