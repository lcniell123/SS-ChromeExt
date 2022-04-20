var t = 0;
var allDimensions = [];
var allImages = [];
var allTypes = [];
var allNewImages = [];
var allNewTypes = [];
var allNewDimensions = [];
var allFinalNewImages = [];
var allFinalNewTypes = [];
var allFinalNewDimensions = [];

var id = 0;
var totalUrls = 0;
var newImage;
var adType;
var theAdType;


chrome.runtime.onInstalled.addListener(() => {




  console.log("Installed");
  chrome.storage.local.set({ theAdType: "Display" });

  chrome.contextMenus.create({
    id: "copyDisplay",
    title: "Copy Display Ad",
    contexts: ["image", "frame"],
  });

  chrome.contextMenus.create({
    id: "pasteDisplay",
    title: "Paste Display Ad",
    contexts: [ "frame"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  var copySrc;
  if (info.frameUrl) {
    copySrc = info.frameUrl;
  } else if (info.srcUrl) {
    copySrc = info.srcUrl;
  }


  // Copy Item
  if (
    info.menuItemId === "copyDisplay" ||
    info.menuItemId === "copyVideo" ||
    info.menuItemId === "copySocial"
  ) {
    chrome.storage.local.set({ copiedIframeSrc: copySrc });
    chrome.scripting.executeScript({
      target: {
        tabId: tab.id,
        frameIds: [info.frameId],
      },
      function: copySource,
    });
  }

  function copySource() {
    chrome.storage.local.get(["theAdType", "copiedIframeSrc"], function (data) {
      var clickedFrameDimensions;
      var images = document.getElementsByTagName("img");
      // get Dimension
      for (const element of images) {
        if (element.src === data.copiedIframeSrc) {
          clickedFrameDimensions = element.width + "x" + element.height;
          chrome.storage.local.set({ ssDimension: clickedFrameDimensions });
        }
      }

      if(data.theAdType==="Social"){

        let bg = document.createElement("div");
      bg.setAttribute("id", "socialPanel");
      bg.style.cssText = `
            position: fixed;
            width: 100vw;
            height: 100vh;
            background-color: #404040;
            z-index: 200000000;
            top: 0;
            left: 0;
            `;

      let screen = document.createElement("div");
      screen.setAttribute("id", "screen");
      screen.style.cssText = `
            width: auto;
            height: 900px;
            text-align:center;
            background-color: white;
            z-index: 20000000000000000;
            text-align:center;
            `;

      let image = document.createElement("img");
      image.setAttribute("id", "socialPaste");
      var pasteIcon = chrome.runtime.getURL("/images/social-paste.jpg");
      image.setAttribute("src", pasteIcon);
      image.style.cssText = `
            height:95vh;
            text-align:center;
            //background-color: white;
            z-index: 20000000000000000;
            margin:  auto;
            width:auto;
            `;

      screen.style.cssText = `
            width: auto;
            height: 100vh
            background-color: white;
            z-index: 2000000000000000000000000000;
            text-align:center;
            margin: 2.5vh auto;
            `;

      document.body.appendChild(bg);
      document.body.appendChild(screen);
      screen.appendChild(image);
      bg.appendChild(screen);

      }
    });
  }

  // Paste Item
  if (
    info.menuItemId === "pasteDisplay" ||
    info.menuItemId === "pasteVideo" ||
    info.menuItemId === "pasteSocial"
  ) {
    chrome.scripting.executeScript({
      target: {
        tabId: tab.id,
        frameIds: [info.frameId],
      },
      function: pasteSource,
    });
  }

  function pasteSource() {
    var clickedFrameDimensions = innerWidth + "x" + innerHeight;
    chrome.storage.local.set({ ssDimension: clickedFrameDimensions });
    chrome.storage.local.get(["copiedIframeSrc", "theAdType"], function (data) {
      //.log("The dataAdType is: " + data.theAdType);
      if (data.theAdType === "Display") {
        document.querySelector("body").innerHTML = "";
        document.querySelector("body").innerHTML =
          "<iframe id='updatedIframe'  src=" + data.copiedIframeSrc + ">";
        document.getElementById("updatedIframe").height = innerHeight;
        document.getElementById("updatedIframe").width = innerWidth;
        document.getElementById("updatedIframe").style.border = "0px";
      } else if (data.theAdType === "Video") {
        document.querySelector("body").innerHTML = "";
        document.querySelector("body").innerHTML =
          "<iframe id='updatedIframe'  src=" + data.copiedIframeSrc + ">";
        document.getElementById("updatedIframe").height = innerHeight;
        document.getElementById("updatedIframe").width = innerWidth;
        document.getElementById("updatedIframe").style.border = "0px";
      } else if (data.theAdType === "Social") {
        document.getElementById("socialPaste").src = data.copiedIframeSrc;
      }
    });
  }
});

// Set Copy/Paste By type
chrome.runtime.onMessage.addListener(function onMessage(msg) {

  adType = msg.inputAdType;

  if (!msg.inputAdType) {
    adType = "Display";
  }

  if (msg.message === "getAdType") {
    chrome.storage.local.set({ theAdType: msg.inputAdType });


    chrome.storage.local.get("theAdType", function (data) {
      if (data.theAdType === "Display") {
        chrome.contextMenus.removeAll();
 

        chrome.contextMenus.create({
          id: "copyDisplay",
          title: "Copy Display Ad",
          contexts: ["image", "frame"],
        });

        chrome.contextMenus.create({
          id: "pasteDisplay",
          title: "Paste Display Ad",
          contexts: [ "frame"],
        });

      } else if (data.theAdType === "Video") {
        chrome.contextMenus.removeAll();
        console.log("msg.type");

        chrome.contextMenus.create({
          id: "copyVideo",
          title: "Copy Video ",
          contexts: ["all"],
        });

        chrome.contextMenus.create({
          id: "pasteVideo",
          title: "Paste Video ",
          contexts: ["frame","video"],
        });
      } else if (data.theAdType === "Social") {
        chrome.contextMenus.removeAll();

        chrome.contextMenus.create({
          id: "copySocial",
          title: "Copy Social",
          contexts: ["image"],
        });

        chrome.contextMenus.create({
          id: "pasteSocial",
          title: "Paste Social",
          contexts: ["image"],
        });

      }
    });
  }
  return true;
});

chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {



  // Resize Window
  
    if (request && request.message === "resizeWindow") {
      chrome.windows.getCurrent(function (window) {
        var updateInfo = {
          width: 1500,
          height: 1000,
        };

        chrome.tabs.query(
          { currentWindow: true, active: true },
          function (tabs) {
            chrome.windows.update(tabs[0].windowId, updateInfo);
          }
        );
      });
    }




  // Select Mobile



  if (request.message === "getActiveUrl") {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
      sendResponse({ currentUrl: tabs[0].url });
    });
    return true;
  }

  if (request.message === "getIframes") {
    chrome.webNavigation.onCompleted.addListener(function (e) {
      chrome.webNavigation.getAllFrames({ tabId: e.tabId }, function (details) {
        console.dir(details);
        sendResponse({ currentUrl: details });
      });
    });

    return true;
  }

  if (request.message === "new-tab") {
    t++;
    if (t <= 1) {
      id++;
      chrome.tabs.create(
        { url: "screenshot.html?id=" + id, active: false },
        function (tab) {
          chrome.storage.local.set({ ssUrl: tab.pendingUrl });
          t = 0;
          sendResponse('Completed');
           return true;
        }
      );
    }
    
  }

  // Screenshot
  //// Capture
  if (request.message === "capture") {
    newImage = chrome.tabs.captureVisibleTab(
      null,
      {},
      function (dataUrl) {
        allTypes.push(request.type);
        chrome.storage.local.get("ssDimension", function (data) {
          sendResponse({
            imgData: dataUrl,
            newDimensions: data.ssDimension,
            newType: request.type,
          });
          allDimensions.push(data.ssDimension);
        });

        chrome.storage.local.set({ ssType: request.type });
        chrome.storage.local.set({ theImage: dataUrl });
      }
    );
    return true;
    
  }

  //// Capture Second Time
  if (request.message === "capture2") {
    chrome.tabs.captureVisibleTab(null, {}, function (dataUrl) {
      sendResponse({ imgData2: dataUrl });
    });
  }

 


  // Create PDF

  if (request.message === "make-pdf") {
    allNewImages = [];
    allNewDimensions = [];
    allNewTypes = [];
 

    chrome.tabs.query({}, function (tabs) {

      tabs.forEach(function (tab) {
        if (tab.url.includes("screenshot.html")) {

          chrome.tabs.sendMessage(
            tab.id,
            {
              message: "getImageData",
            },
            async function (response) {
              await getAllImageDataFromScreenshot().then(
                async (info) => {
                  await chrome.storage.local.get(
                    ["ssUrl"],
                    async function (data) {
                      sendResponse({
                        url: data.ssUrl,
                        allImgs: info.allNewImagess,
                        dimension: info.allNewDimensionss,
                        type: info.allNewTypess,
                        data: info,
                      });
                    }
                  );
                }
              );

              async function getAllImageDataFromScreenshot() {
                var allNewImage = await response.getImageSrc;
                var allNewDimension = await response.getImageDimension;
                var allNewType = await response.getImageType;

                allNewImages.push(await response.getImageSrc);
                allNewDimensions.push(await response.getImageDimension);
                allNewTypes.push(await response.getImageType);

                return {
                  allNewDimension: allNewDimension,
                  allNewImage: allNewImage,
                  allNewType: allNewType,
                  allNewDimensionss: allNewDimensions,
                  allNewImagess: allNewImages,
                  allNewTypess: allNewTypes,
                };
              }

              return true;
            }
          );
        }
        return true;
      });
    });
  }
  //  sendResponse('Completed');
});
