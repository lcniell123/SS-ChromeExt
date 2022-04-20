var isSocial;
var getSingleSrc;
var getSingleDimension;
var getSingleType;
var getImageSrc;
var getImageType;
var getImageDimension;
var t = 0;
var times = 0;

chrome.runtime.onMessage.addListener(async function (
  msg,
  sender,
  sendResponse
) {
  t++;
  if (t > 1) {
    return true;
  }

  if (msg.message === "new-image") {
    getSingleDimension = msg.dimensions;
    getSingleType = msg.type;

    if (!document.title) {
      if (msg.dimensions === "300x250") {
        document.title = "SS-300x250";
      } else if (msg.dimensions === "300x600") {
        document.title = "SS-300x600";
      } else if (msg.dimensions === "160x600") {
        document.title = "SS-160x600";
      } else if (msg.dimensions === "728x90") {
        document.title = "SS-728x90";
      } else if (msg.dimensions === "320x50") {
        document.title = "SS-320x50";
      }

      if (msg.type === "Video") {
        document.title = "SS-Video";
      }

      if (msg.type === "Social") {
        document.title = "SS-Social";
      }
    }

    var imgEx = document.querySelector("img");
    if (!imgEx) {
      var image = new Image();
      if (isSocial === "Facebook") {
        image.src = msg.url;
      } else {
        image.src = msg.image;
      }
      image.src = msg.image;
      image.style.width = "100%";
      image.style.position = "absolute";
      var link = document.querySelector("a");
      link.appendChild(image);
      link.href = msg.image;
    }
    sendResponse("Completed")
  }

  cropImages();

  function cropImages() {
    chrome.runtime.sendMessage(
      { message: "capture2" },
      async function (response) {
        let imgCapt = response.imgData2;
        var image2 = new Image();
        image2.src = imgCapt;

        var c = document.querySelector("canvas");
        if (c) {
          c.style.width = 1500;
          c.style.height = 917;
          c.style.border = "solid 1px black";
          c.style.position = "absolute";
          var ctx = c.getContext("2d");
          image2.onload = async function () {
            c.width = c.clientWidth;
            c.height = c.clientHeight;
            const loaded = await image2;
            const iw = loaded.width;
            const ih = loaded.height;
            const cw = c.width;
            const ch = c.height;
            const f = Math.max(cw / iw, ch / ih);

            ctx.setTransform(
              /*     scale x */ f,
              /*      skew x */ 0,
              /*      skew y */ 0,
              /*     scale y */ f,
              /* translate x */ (cw - f * iw) / 2,
              /* translate y */ (ch - f * ih) / 2
            );
            //  }

            ctx.drawImage(loaded, 0, 0);

            getSingleSrc = c.toDataURL({
              format: 'jpeg',
              quality: 0.1 // compression works now!
          });
            document.querySelector("canvas").remove();
          };
        }
      }
    );
    return true;
  }
  return true;
});

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  // Find and Replace iframe
  if (msg.message === "getImageData") {
    sendResponse({
      imageUrl: "ImageUrlFromTab",
      getImageSrc: getSingleSrc,
      getImageType: getSingleType,
      getImageDimension: getSingleDimension,
    });
  }
});
