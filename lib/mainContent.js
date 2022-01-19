const fs = require("fs");
const path = require("path");
const calculateSizeD = require("./calculateSizeD");
const calculateSizeF = require("./calculateSizeF");

const buildMainContent = (FullStaticPath, pathname) => {
  let mainContent = "";
  let items;

  //loop through the elements inside the folder
  try {
    items = fs.readdirSync(FullStaticPath);
    console.log(items);
  } catch (err) {
    console.log(`readdirSync error : ${err}`);
  }

  //remove .DS store
  items = items.filter((element) => element !== ".DS_Store");

  //Home Directory, remove project files
  if (pathname === "/") {
    items = items.filter(
      (element) => !["project_files", "ace-builds-master"].includes(element)
    );
  }

  //get the following elements for each item :
  items.forEach((element) => {
    let itemDetails = {};

    //name
    itemDetails.name = element;

    //link
    const link = path.join(pathname, element);

    //
    //get stats of the item
    const itemFullStaticPath = path.join(FullStaticPath, element);
    try {
      itemDetails.stats = fs.statSync(itemFullStaticPath);
    } catch (err) {
      console.log(`statSync error: ${err}`);
      mainContent = `<div class="alert alert-danger">Internal Server error</div>`;
      return false;
    }

    if (itemDetails.stats.isDirectory()) {
      itemDetails.icon = '<ion-icon name="folder"></ion-icon>';
      [itemDetails.size, itemDetails.sizeBytes] =
        calculateSizeD(itemFullStaticPath);
    } else if (itemDetails.stats.isFile()) {
      itemDetails.icon = '<ion-icon name="document"></ion-icon>';
      [itemDetails.size, itemDetails.sizeBytes] = calculateSizeF(
        itemDetails.stats
      );
    }

    //When was the file last changed
    itemDetails.timeStamp = parseInt(itemDetails.stats.mtimeMs);

    //convert timestamp to a data
    itemDetails.date = new Date(itemDetails.timeStamp);

    itemDetails.date = itemDetails.date.toLocaleString();
    console.log(itemDetails.date);

    mainContent += `
<tr data-name = "${itemDetails.name}" data-size = "${itemDetails.sizeBytes}" time-stamp ="${itemDetails.timeStamp}">
    <td>${itemDetails.icon}<a href = "${link}" target='${itemDetails.stats.isFile() ? "_blank": ""}'>${element}</a></td>
    <td>${itemDetails.size}</td>
    <td>${itemDetails.date}</td>
</tr>`;
  });
  //name
  //icon
  //link to the item
  //size
  //last modified
  return mainContent;
};

module.exports = buildMainContent;
