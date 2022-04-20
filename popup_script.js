chrome.storage.local.get("theAdType", function (data) {
  document.getElementById("adType").value = data.theAdType;
});

// onLoad
let selectAdType = document.getElementById("adType").value;
chrome.runtime.sendMessage({
  message: "getAdType",
  inputAdType: selectAdType
});

chrome.storage.local.get("theIsMobile", function (data) {
  document.getElementById("isMobile").checked = data.theIsMobile;
});

// Resize Window
let resize = document.getElementById("ratio");

resize.addEventListener("click", async (evt) => {
  evt.preventDefault(); // prevents `submit` event from reloading the popup
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: resizeWindow
  });
  return true;
});

function resizeWindow() {
  chrome.runtime.sendMessage({ message: "resizeWindow" });
}

// Select Mobile
let mobileSelect = document.getElementById("isMobile");

mobileSelect.addEventListener("change", async (evt) => {
  evt.preventDefault(); 
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: showMobile
  });

  chrome.tabs.sendMessage(tab.id, {
    message: "isMobile",
    checked: mobileSelect.checked
  });

  chrome.runtime.sendMessage(
    {
      message: "getActiveUrl"
    },
    function (response) {
      chrome.storage.local.set({ theCurrentUrl: response.currentUrl });
    }
  );
  //  return true;
});

function showMobile() {
  var t = 0;
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      chrome.storage.local.set({ theIsMobile: msg.checked });
    chrome.storage.local.get("theIsMobile", function (data) {
      msg.checked = data.theIsMobile;
    });
    if (msg.message === "isMobile" && t < 1) {
      t++;
      var mobilePanelBg = document.getElementById("mobilePanelBg");
      var screen = document.getElementById("screen");

      //iPhone 6/7/8
      if (msg.checked || !screen || !mobilePanelBg) {
        let bg = document.createElement("div");
        bg.setAttribute("id", "mobilePanelBg");
        bg.style.cssText = `
            position: fixed;
            width: 100vw;
            height: 100vh;
            background-color: rgb(56 56 56);
            z-index: 200000000;
            top: 0;
            left: 0;
            `;

        screen = document.createElement("div");
        screen.setAttribute("id", "screen");
        var phoneImg = chrome.runtime.getURL("/images/phone/MobilePhone.png");

        if ($("#mobileIframe").length <= 0) {
          let iframe = document.createElement("iframe");
          iframe.setAttribute("id", "mobileIframe");

          chrome.storage.local.get("theCurrentUrl", function (data) {
            iframe.setAttribute("src", data.theCurrentUrl);
            iframe.style.cssText = `
                  z-index: 2147483647;
    top: 20vh;
    margin: auto;
    background-size: contain;
    background-repeat: no-repeat;
    border: 0px;
    padding-top: 10vh;
    height: 80vh;
        width: 40vh;
              `;

            screen.style.cssText = `
            width: 50vw;
            margin: auto;
            text-align:center;
            background-image:url(${phoneImg});
            background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    height: 100vh;
            `;

            document.body.appendChild(bg);
            document.body.appendChild(screen);
            screen.appendChild(iframe);
            bg.appendChild(screen);
           
          });
        }
      } else {
        var id_mPanel = $("[id=mobilePanelBg]");
        var id_mScreen = $("[id=screen]");

        if (id_mPanel.length > 0 || id_mScreen.length > 0) {
          $("[id=mobilePanelBg]").remove();
          $("[id=screen]").remove();
        }
        t = 0;
      }
    }
    sendResponse('completed'); 
  });
}

// Select Ad Type
let selectType = document.getElementById("adType");

selectType.addEventListener("change", async (evt) => {
  chrome.storage.local.set({ theAdType: adType.value });
  evt.preventDefault(); // prevents `submit` event from reloading the popup
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: getTypes
  });

  chrome.runtime.sendMessage({
    message: "getAdType",
    inputAdType: selectType.value
  });
  return true;
});

function getTypes() {
  chrome.storage.local.get("theAdType", function (data) {
    if (data.theAdType === "Display") {
      $("#socialPanel").remove();

      chrome.runtime.sendMessage({
        message: "getAdType",
        inputAdType: data.theAdType
      });
    }

    if (data.theAdType === "Video") {
      $("#socialPanel").remove();
      chrome.runtime.sendMessage({
        message: "getAdType",
        inputAdType: data.theAdType
      });
    }

    if (data.theAdType === "Social") {
      chrome.runtime.sendMessage({
        message: "getAdType",
        inputAdType: data.theAdType
      });
    }
  });
}

// Screenshot
let takeShot = document.getElementById("snapshot");

takeShot.addEventListener("click", async (evt) => {
  evt.preventDefault(); // prevents `submit` event from reloading the popup
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: takeSnap
  });

  chrome.tabs.sendMessage(tab.id, {
    message: "snap",
    type: document.getElementById("adType").value
  });
  return true;
});

function takeSnap() {
  var i = 0;
  chrome.runtime.onMessage.addListener(function (msg,sendResponse) {
    var t = 0;
    if (msg.message === "snap" && i < 1) {
      //Stop Multiple Tabs
      if (t < 2) {
        chrome.runtime.sendMessage(
          { message: "new-tab", url: msg.text },
          function (response) {
            t++;
          }
        );
      }

      chrome.runtime.sendMessage(
        {
          message: "capture",
          type: msg.type
        },
        function (response) {
          chrome.runtime.sendMessage({
            message: "new-image",
            image: response.imgData,
            dimensions: response.newDimensions,
            url: msg.text,
            type: msg.type
          });
          window.location.reload();
        }
      );
    }
    i++;
    sendResponse('Completed');
  });
}

// Create PDF
let newPdf = document.getElementById("createPdf");
newPdf.addEventListener("click", async (evt) => {
  newPanel();
});

function newPanel() {
  let bg = document.createElement("div");
  bg.style.cssText = `
  position: fixed;
  width: 100vw;
  height: 100vh;
  background-color: #0000007a;
  z-index: 200;
  top: 0;
  left: 0
  `;
  bg.setAttribute("id", "bg");

  let panel = document.createElement("div");
  panel.style.cssText = `
  position: fixed;
  width: 100vw;
  left: 0px;
  top: 0px;
  height: 100vh;
  text-align: center;
  padding: 0px;
  background: white;
  z-index: 500;
  border: 1px solid lightgray;
  `;
  panel.setAttribute("id", "dmg-panel");
  panel.innerHTML =
    '<div class="container"> <div class="row"><div class="col"><button id="close" style=" left:0px; top:0px">X</button></div></div> <div class="row"><div class="col"><input type="text"  id ="campaign"   placeholder="Campaign Name"/></div></div> <div class="row"><div class="col"><input type="date"  id ="date"  placeholder="Add date"/> </div> </div> <div class="row">  <div class="col"><button id="finalPdf" >Download PDF</button></div></div></div>';

  //Create Panel
  document.body.appendChild(bg);
  bg.appendChild(panel);

  //Close Panel
  document.getElementById("close").onclick = close;

  //To Storage
  // theCampaign
  chrome.storage.local.get("theCampaign", function (data) {
    document.getElementById("campaign").value = data.theCampaign;
  });

  // theDate
  chrome.storage.local.get("theDate", function (data) {
    if (!data.theDate) {
      var today = new Date();
      var dd = String(today.getDate()).padStart(2, "0");
      var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
      var yyyy = today.getFullYear();
      today = yyyy + "-" + mm + "-" + dd;

      document.getElementById("date").value = today;
    } else {
      document.getElementById("date").value = data.theDate;
    }
  });

  function close() {
    document.getElementById("dmg-panel").remove();
    document.getElementById("bg").remove();
  }

  let fPDF = document.getElementById("finalPdf");
  fPDF.addEventListener("click", async (evt) => {
    evt.preventDefault(); // prevents `submit` event from reloading the popup
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: finalPDF
    });

    const campaign = document.getElementById("campaign").value;
    const date = document.getElementById("date").value;
    chrome.tabs.sendMessage(tab.id, {
      message: "thepdf",
      id: tab.id,
      campaign,
      date
    });
  });

  function finalPDF() {
    var test = 0;

    chrome.runtime.onMessage.addListener(function onMessage(msg, sender, sendResponse) {
      if (msg.message === "thepdf" && test < 1) {
        test++;
        console.log("this is test: " + test);

        const campaign = msg.campaign;
        const inpDate = msg.date;

        let origDate = new Date(inpDate); // 2009-11-10
        const newDate = origDate.toLocaleString("default", {
          year: "numeric",
          month: "long"
        });

        chrome.storage.local.set({ theCampaign: campaign });
        chrome.storage.local.set({ theDate: inpDate });

        chrome.runtime.sendMessage(
          { message: "make-pdf" },
          async function (response) {
            var img = await getAllImageDataFromBg().then((data) => {
              return true;
            });

            async function getAllImageDataFromBg() {
              var allNewImages = await response.allImgs;
              var allNewDimensions = await response.dimension;
              var allNewTypes = await response.type;

              return {
                allNewDimensionss: allNewDimensions,
                allNewImagess: allNewImages,
                allNewTypess: allNewTypes
              };
            }

            createPDF();

            async function createPDF() {
              window.jsPDF = window.jspdf.jsPDF;
              const doc = new jsPDF("l", "in", [6.25, 11], { compress: true });
              let width = doc.internal.pageSize.getWidth();
              let height = doc.internal.pageSize.getHeight();
              var imgArrayLength = await response.allImgs.length;
              var imageCode = await response.url;
              var str = await response.url;
              imageCode = imageCode.replace(str.substring(51, str.length), "");

              //Intro Page
              var introImg = new Image();
              introImg.src = imageCode + "/images/backgrounds/intro.jpg";
              doc.addImage(introImg, "jpeg", 0, 0, width, height, "", "FAST");
              doc.setFontSize(33);
              doc.addFileToVFS("raleway.ttf", font);
              doc.addFont("raleway.ttf", "raleway", "normal");
              doc.setFont("raleway");
              var lines = doc.splitTextToSize(campaign, 5);

              // Into Title
              for (var l = 0; l <= lines.length; l++) {
                if (lines.length == 1) {
                  doc.text(lines, 10.25, 2.83, "right");
                } else if (lines.length == 2) {
                  doc.text(lines, 10.25, 2.25, "right");
                } else if (lines.length == 3) {
                  doc.text(lines, 10.25, 1.75, "right");
                } else if (lines.length == 4) {
                  doc.text(lines, 10.25, 1.75, "right");
                }
              }

              doc.setFontSize(20);
              doc.text(newDate, 10.25, 3.65, "right");

              for (var i = 0; i < imgArrayLength; i++) {
                console.log("response.type");
                console.log(response.type);
                var pageBg = new Image();
                if (response.type[i] === "Display") {
                  console.log("started creating pdf-4");

                  pageBg.src =
                    (await imageCode) +
                    "/images/backgrounds/" +
                    response.dimension[i] +
                    ".jpg";
                } else if (response.type[i] === "Video") {
                  pageBg.src =
                    (await imageCode) +
                    "/images/backgrounds/" +
                    response.type[i] +
                    ".jpg";
                } else if (response.type[i] === "Social") {
                  pageBg.src =
                    (await imageCode) +
                    "/images/backgrounds/" +
                    response.type[i] +
                    ".jpg";
                }
                doc.addPage();

                //Add BG
                doc.addImage(pageBg, "jpeg", 0, 0, width, height, undefined,'FAST');

                // //Add image
                img = new Image();
                img.src = response.allImgs[i];

                doc.addImage(img, "jpeg", 3, 0.705, 7.833, 4.83, undefined,'FAST');
              }

              //Download pdf
              var compEdit = await campaign.split(" ").join("");
              var dateEdit = await newDate.substring(0, 4);
              doc.save(compEdit + "-SS-" + dateEdit + ".pdf");
            }
            return true;
          }
        );
      }
      sendResponse('completed'); 
    });
  }
}
