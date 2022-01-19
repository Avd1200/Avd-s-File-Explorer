const {execSync} = require('child_process');

const calculateSizeD = itemFullStaticPath => {
  //escape space, tabs, etc
  const itemFullStaticPathCleaned = itemFullStaticPath.replace(/\s/g,'\ ');
  
  const commandOutput = execSync(`du -sh "${itemFullStaticPathCleaned}"`).toString();
  
  console.log(commandOutput);

  //remove spaces, tabs, etc
  
  let filesize = commandOutput.replace(/\s/g, '');
  filesize = filesize.replace("C:",'');
  //split filesize using the '\' separator
  filesize = filesize.split('\\');
  
  //human size is the first item of the array
  filesize = filesize[0];
  console.log(filesize);
  
  //unit
  const filesizeUnit = filesize.replace(/\d|\./g,'');
  console.log(filesizeUnit);
  
  //size number
  const filesizeNumber = parseFloat(filesize.replace(/[a-z]/i,''));
  console.log(filesizeNumber);
  
  const units = "BKMGT";
  console.log(units);
  console.log(units.indexOf(filesizeUnit.toString()));
  const filesizeBytes = filesizeNumber * Math.pow(1000,units.indexOf(filesizeUnit.toString()));
    
    console.log(filesizeBytes);
    
    return [filesize, filesizeBytes];
}

module.exports = calculateSizeD;