// ==UserScript==
// @name        NamuFix
// @namespace   http://litehell.info/
// @description 나무위키 편집 인터페이스 등을 개선합니다.
// @include     http://namu.wiki/*
// @include     https://namu.wiki/*
// @version     150809.0
// @namespace   http://litehell.info/
// @downloadURL https://raw.githubusercontent.com/LiteHell/NamuFix/dev1/NamuFix.user.js
// @require     https://raw.githubusercontent.com/LiteHell/NamuFix/dev1/FlexiColorPicker.js
// @require     https://raw.githubusercontent.com/Caligatio/jsSHA/v2.0.1/src/sha512.js
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_listValues
// @run-at      document-end
// ==/UserScript==

GM_addStyle("em{font-style: italic;}");
GM_xmlhttpRequest({
  method: "GET",
  url: "https://raw.githubusercontent.com/LiteHell/NamuFix/dev1/NamuFix.css",
  onload: function(res) {
    GM_addStyle(res.responseText);
  }
});

var ENV = {};
ENV.IsEditing = /https?:\/\/namu\.wiki\/edit\/(.+?)/.test(location.href);
ENV.Discussing = /https?:\/\/namu\.wiki\/topic\/(.+?)/.test(location.href);

var SET = new function() {
  var discards = ['save', 'load'];
  this.save = function() {
    for (var i in this) {
      if (discards.indexOf(i) != -1) continue;
      GM_setValue('SET_' + i, this[i]);
    }
  };
  this.load = function() {
    var sets = GM_listValues;
    for (var i = 0; i < sets.length; i++) {
      var now = sets[i];
      if (now.indexOf('SET_') != 0) continue;
      if (discards.indexOf(now) != -1) continue;
      this[now.substring(4)] = GM_getValue(now);
    }
  };
};

var NEWindow = function() {
  var wi = document.createElement('div');
  var wiHead = document.createElement('div');
  var wiContainer = document.createElement('div');
  var wiFoot = document.createElement('div');

  wi.className = 'NamaEditor NEWindowRoot';
  wiHead.className = 'NamaEditor NEWindowHead';
  wiContainer.className = 'NamaEditor NEWindowContainer';
  wiFoot.className = 'NamaEditor NEWindowFoot';

  wi.appendChild(wiHead);
  wi.appendChild(wiContainer);
  wi.appendChild(wiFoot);

  var wrapper = document.createElement('div');
  wrapper.style.background = 'rgba(0,0,0,0.5)';
  wrapper.style.zIndex = '9999';
  wrapper.style.position = 'fixed';
  wrapper.style.left = '0px';
  wrapper.style.top = '0px';
  wrapper.style.height = '100%';
  wrapper.style.width = '100%';

  wrapper.appendChild(wi);
  document.body.appendChild(wrapper);
  var r = {
    title: function(text) {
      wiHead.innerHTML = text;
      return r;
    },
    content: function(callback) {
      callback(wiContainer);
      return r;
    },
    foot: function(callback) {
      callback(wiFoot);
      return r;
    },
    button: function(label, onclick) {
      var btn = document.createElement('button');
      btn.setAttribute('type', 'button');
      btn.innerHTML = label;
      btn.addEventListener('click', onclick);
      wiFoot.appendChild(btn);
      return r;
    },
    close: function() {
      wrapper.parentNode.removeChild(wrapper);
      return undefined;
    }
  };
  return r;
}

if (ENV.IsEditing || ENV.Discussing) {
  if (document.querySelectorAll("textarea").length == 1) {
    var rootDiv = document.createElement("div");

    // Init (Add Elements)
    var buttonBar = document.createElement('div');
    var txtarea = document.createElement('textarea');
    buttonBar.className = 'NamaEditor NEMenu';
    txtarea.className = 'NamaEditor NETextarea'
    txtarea.name = document.querySelector("textarea").name;
    rootDiv.className += ' NamaEditor NERoot';
    rootDiv.appendChild(buttonBar);
    rootDiv.appendChild(txtarea);

    // Functions To Design
    var Designer = {};
    Designer.button = function(txt) {
      var btn = document.createElement('button');
      btn.className = 'NamaEditor NEMenuButton';
      btn.setAttribute('type', 'button');
      btn.innerHTML = txt;

      buttonBar.appendChild(btn);
      var r = {
        click: function(func) {
          btn.addEventListener('click', func);
          return r;
        },
        hoverMessage: function(msg) {
          btn.setAttribute('title', msg);
          return r;
        },
        right: function() {
          btn.className += ' NEright';
          return r;
        },
        active: function() {
          btn.setAttribute('active', 'yes');
          return r;
        },
        deactive: function() {
          btn.removeAttribute('active')
          return r;
        },
        remove: function() {
          btn.parentNode.removeChild(btn);
          return r;
        },
        use: function() {
          buttonBar.appendChild(btn);
          return r;
        }
      };
      return r;
    };
    Designer.dropdown = function(txt) {
      var dropdownButton = document.createElement("div");
      var dropdown = document.createElement("div");
      var dropdownList = document.createElement("ul");
      dropdownButton.innerHTML = '<div class="NEDropdownButtonLabel NamaEditor">' + txt + '</div>';
      dropdownButton.className = 'NamaEditor NEMenuButton';
      dropdown.className = 'NamaEditor NEDropDown';
      dropdown.appendChild(dropdownList);
      dropdownButton.appendChild(dropdown);
      buttonBar.appendChild(dropdownButton);

      var dbHover = false,
        dbBHover = false;
      dropdownButton.addEventListener('mouseover', function() {
        dbBHover = true;
      });
      dropdown.addEventListener('mouseover', function() {
        dbHover = true;
      });
      dropdownButton.addEventListener('mouseleave', function() {
        dbBHover = false;
      });
      dropdown.addEventListener('mouseleave', function() {
        dbHover = false;
      });
      var shower = setInterval(function() {
        if (dbHover || dbBHover) {
          dropdownButton.setAttribute('hover', 'yes');
          dropdown.style.display = '';
        } else {
          dropdownButton.removeAttribute('hover');
          dropdown.style.display = 'none';
        }
      }, 50);

      var hr = {
        button: function(iconTxt, txt) {
          var liTag = document.createElement('li');
          liTag.innerHTML = '<span class="NEHeadIcon">' + iconTxt + '</span><span class="NEDescText">' + txt + '</span>'
          liTag.addEventListener('click', function() {
            dbHover = false;
            dbBHover = false;
          })
          dropdownList.appendChild(liTag);
          var r = {
            icon: function(iconTxt) {
              liTag.querySelector('.NEHeadIcon').innerHTML = iconTxt;
              return r;
            },
            text: function(txt) {
              liTag.querySElector('.NEDescText').innerHTML = txt;
              return r;
            },
            hoverMessage: function(msg) {
              liTag.setAttribute('title', msg);
              return r;
            },
            click: function(handler) {
              liTag.addEventListener('click', handler);
              return r;
            },
            right: function() {
              liTag.className += 'NEright';
              return r;
            },
            remove: function() {
              dropdownList.removeChild(liTag);
              return r;
            },
            insert: function() {
              dropdownList.appendChild(liTag);
              return r;
            },
            backwalk: function() {
              dropdownList.removeChild(ilTag);
              dropdownList.appendChild(ilTag);
              return r;
            }
          };
          return r;
        },
        right: function() {
          liTag.className += 'NEright';
          return hr;
        },
        hoverMessage: function(txt) {
          dropdownButton.setAttribute('title', txt);
          return hr;
        },
        clear: function() {
          dropdownList.innerHTML = '';
          return hr;
        }
      };
      return hr;
    };

    // Functions To Process
    var TextProc = {};
    (function(r, txtarea) {
      r.value = function() {
        if (arguments.length == 0) return txtarea.value;
        else txtarea.value = arguments[0];
      };
      r.selectionText = function() {
        if (arguments.length == 0) return txtarea.value.substring(txtarea.selectionStart, txtarea.selectionEnd);
        else {
          var s = txtarea.selectionStart;
          var t = txtarea.value.substring(0, txtarea.selectionStart);
          t += arguments[0];
          t += txtarea.value.substring(txtarea.selectionEnd);
          txtarea.value = t;
          txtarea.focus();
          txtarea.selectionStart = s;
          txtarea.selectionEnd = s + arguments[0].length;
        }
      };
      r.selectionStart = function() {
        if (arguments.length == 0) return txtarea.selectionStart;
        else txtarea.selectionStart = arguments[0];
      };
      r.selectionTest = function(r) {
        return this.selectionText().search(r) != -1;
      };
      r.valueTest = function(r) {
        return this.value().search(r) != -1;
      };
      r.selectionEnd = function() {
        if (arguments.length == 0) return txtarea.selectionEnd;
        else txtarea.selectionEnd = arguments[0];
      };
      r.selectionLength = function() {
        if (arguments.length == 0) return (txtarea.selectionEnd - txtarea.selectionStart);
        else txtarea.selectionEnd = txtarea.selectionStart + arguments[0];
      };
      r.select = function(s, e) {
        txtarea.focus();
        txtarea.selectionStart = s;
        if (typeof e !== 'undefined') txtarea.selectionEnd = e;
      }
      r.WrapSelection = function(l, r) {
        if (arguments.length == 1) var r = l;
        var t = this.selectionText();
        if (typeof t === 'undefined' || t == null || t == '') t = '내용';
        var s = this.selectionStart()
        t = l + t + r;
        this.selectionText(t);
        this.select(s + l.length, s + t.length - r.length)
      };
      r.ToggleWrapSelection = function(l, r) {
        if (arguments.length == 1) var r = l;
        var t = this.selectionText();
        if (t.indexOf(l) == 0 && t.lastIndexOf(r) == (t.length - r.length)) {
          var s = this.selectionStart();
          this.selectionText(t.substring(l.length, t.length - r.length));
          this.select(s, s + t.length - l.length - r.length);
        } else {
          this.WrapSelection(l, r);
        }
      };
    })(TextProc, txtarea);

    // Some Basic MarkUp Functions
    function FontSizeChanger(isIncrease) {
      var pattern = /^{{{\+([1-5]) (.+?)}}}$/;
      var t, s = TextProc.selectionStart();
      if (TextProc.selectionTest(pattern)) {
        var t = TextProc.selectionText();
        var fontSize = t.replace(pattern, '$1');
        var innerText = t.replace(pattern, '$2');
        if (isIncrease) fontSize++;
        else fontSize--;

        if (5 < fontSize) fontSize = 5;
        if (fontSize < 1) fontSize = 1;
        t = '{{{+' + fontSize + ' ' + innerText + '}}}';
      } else {
        t = '{{{+1 ' + TextProc.selectionText() + '}}}';
      }
      TextProc.selectionText(t);
      TextProc.select(s, s + t.length);
    }

    function TextColorChange() {
      var colorMarkUpPattern = /^{{{(#[a-zA-Z0-9]+) (.*)}}}$/;
      var color = '#000000',
        text = '';
      if (TextProc.selectionTest(colorMarkUpPattern)) {
        // 색상 마크업이 적용된 텍스트
        var matches = colorMarkUpPattern.exec(TextProc.selectionText());
        color = matches[1];
        text = matches[2];
      } else if (TextProc.selectionText().lengh == 0) {
        // 선택된 텍스트 없음
        text = '내용';
      } else {
        // 텍스트 선택됨
        text = TextProc.selectionText();
      }
      var w = window.NEWindow();
      var c = w.close;
      w.title('색 지정').content(function(e) {
        var pickerWrapper = document.createElement('div');
        var sliderWrapper = document.createElement('div');
        var picker = document.createElement('div');
        var slider = document.createElement('div');
        var pickerIndicator = document.createElement('div');
        var sliderIndicator = document.createElement('div');
        pickerWrapper.appendChild(picker);
        pickerWrapper.appendChild(pickerIndicator);
        sliderWrapper.appendChild(slider);
        sliderWrapper.appendChild(sliderIndicator);

        picker.className = "NamaEditor FlexiColorPicker Picker";
        pickerIndicator.className = "NamaEditor FlexiColorPicker PickerIndicator";
        slider.className = "NamaEditor FlexiColorPicker Slider";
        sliderIndicator.className = "NamaEditor FlexiColorPicker SliderIndicator";
        pickerWrapper.className = "NamaEditor FlexiColorPicker PickerWrapper";
        sliderWrapper.className = "NamaEditor FlexiColorPicker SliderWrapper";

        ColorPicker.fixIndicators(
          sliderIndicator,
          pickerIndicator
        )
        ColorPicker(slider, picker, function(hex, hsv, rgb, pickerCo, sliderCo) {
          ColorPicker.positionIndicators(
            sliderIndicator,
            pickerIndicator,
            sliderCo, pickerCo
          )
          color = hex;
        }).setHex(color);
        e.appendChild(pickerWrapper);
        e.appendChild(sliderWrapper);
      }).button('지정', function() {
        TextProc.selectionText('{{{' + color + ' ' + text + '}}}');
        c();
      }).button('닫기', c);
    }

    // Add Basic MarkUp Buttons
    var decoDropdown = Designer.dropdown('<span class="ion-wand"></span>').hoverMessage('텍스트 꾸미기');
    decoDropdown.button('<strong>A</strong>', '굵게').click(function() {
      TextProc.ToggleWrapSelection("'''");
    });
    decoDropdown.button('<em>A</em>', '기울임꼴').click(function() {
      TextProc.ToggleWrapSelection("''");
    });
    decoDropdown.button('<del>A</del>', '취소선').click(function() {
      TextProc.ToggleWrapSelection("--");
    });
    decoDropdown.button('<span style="text-decoration: underline;">A</span>', '밑줄').click(function() {
      TextProc.ToggleWrapSelection("__");
    });
    decoDropdown.button('<span style="color:red;">A</span>', '글씨색').click(TextColorChange);
    decoDropdown.button('-', '글씨 작게').click(function() {
      FontSizeChanger(false);
    });
    decoDropdown.button('+', '글씨 크게').click(function() {
      FontSizeChanger(true);
    });

    // Insertable Media Functions
    function ImgurUpload() {
      var elm = document.createElement("input");
      elm.setAttribute("type", "file");
      elm.style.visibility = "hidden";
      elm.setAttribute("accept", "image/*");
      document.body.appendChild(elm);
      // http://jsfiddle.net/eliseosoto/JHQnk/ 이용
      elm.addEventListener("change", function(evt) {
        if (evt.target.files.length > 1) {
          alert('한개의 파일만 업로드하실 수 있습니다.');
          return;
        } else if (evt.target.files.length < 0) {
          alert('선택된 파일이 없습니다.');
          return;
        }
        // imgur Client ID : 60a43baebed658a
        var file = evt.target.files[0];
        if (file) {
          var reader = new FileReader();
          reader.onload = function(evt) {
            var res;
            GM_xmlhttpRequest({
              method: "POST",
              headers: {
                Authorization: "Client-ID 60a43baebed658a",
                Accept: "application/json",
                "Content-Type": "application/x-www-form-urlencoded"
              },
              url: "https://api.imgur.com/3/image",
              data: 'type=base64&image=' + encodeURIComponent(reader.result.replace(/.*,/, '')),
              onload: function(response) {
                res = JSON.parse(response.responseText)
                if (!res["success"]) {
                  setStatus("죄송하지만 이미지 업로드에 실패하였습니다.");
                } else {
                  TextProc.selectionText(TextProc.selectionText() + '\n##삭제는 http://imgur.com/delete/' + res["data"]["deletehash"] + '에 접속하여 할 수 있습니다.\n##삭제 링크 외에 기술적으로 자세한 내용은 API 응답을 참고하세요.\n##\n##주석은 지우셔도 되고 삭제 링크 메모후 주석을 지우시는 것을 권장합니다.\n##\n## API 응답 : ' + JSON.stringify(res) + '\n' + res["data"]["link"] + '\n');
                }
              }
            });
            document.body.removeChild(elm);
          };
          reader.readAsDataURL(file);
        }
      });
      elm.click();
      // imgur Client ID : 60a43baebed658a
    };

    // Insertable Media Functions
    function InsertYouTube() {
      var ExtractYouTubeID = function() {
        // from Lasnv's answer from http://stackoverflow.com/questions/3452546/javascript-regex-how-to-get-youtube-video-id-from-url
        var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
        var match = url.match(regExp);
        if (match && match[7].length == 11)
          return match[7];
        else
          return null;
      }
      var url = prompt("YouTube 동영상 주소를 입력해주세요.");
      var extracted = ExtractYouTubeID(url);
      TextProc.selectionText(TextProc.selectionText() + '\n' + extracted != null ? '[youtube(' + extracted + ')]' : '\n## YouTube 동영상 ID 추출에 실패하였습니다. 주소를 확인해주세요.');
    }

    function MapMacro() {
      // title(text), content(callback), foot(callback), button(text,onclick), close
      var win = NEWindow();
      win.title("지도 삽입");
      win.content(function(el) {
        var mapDiv = document.createElement("div");
        mapDiv.id="NFMapDiv";
        mapDiv.style.height = '480px';
        mapDiv.style.width = '640px';
        el.appendChild(mapDiv);
        var initFuncContext = 'var NFMap;\n'+
          'function NFMapInit(){\n'+
          'var firstLocation=new google.maps.LatLng(37.46455,126.67435);\n'+
          'var mapOptions={\n' +
          'zoom: 8,\n' +
          'center: firstLocation\n'+
          '};\n' +
          'NFMap=new google.maps.Map(document.querySelector("#NFMapDiv"),mapOptions);\n'+
          '}';
        var onloadScript = document.createElement("script");
        onloadScript.innerHTML = initFuncContext;
        el.appendChild(onloadScript);
        var mapsAPILib = document.createElement("script");
        mapsAPILib.setAttribute("src", "//maps.googleapis.com/maps/api/js?key=AIzaSyAqi9PjUr_F54U0whrbMeavFfvNap3kjvA&callback=NFMapInit");
        el.appendChild(mapsAPILib);
      });
      win.button("삽입",function(){
        var lat=unsafeWindow.NFMap.getCenter().lat();
        var lng=unsafeWindow.NFMap.getCenter().lng();
        var zoom=unsafeWindow.NFMap.getZoom();
        TextProc.selectionText(TextProc.selectionText()+'\n[Include(틀:지도,position='+lat+'%2C'+lng+',zoom='+zoom+')]');
        win.close();
      })
      win.button("닫기",win.close);
    }
    // Add Insertable Things
    var insertablesDropDown = Designer.dropdown('<span class="ion-paperclip"></span>').hoverMessage('삽입 가능한 미디어');
    insertablesDropDown.button('<span class="ion-image"></span>', '사진(Imgur)').click(ImgurUpload);
    insertablesDropDown.button('<span class="ion-social-youtube" style="color:red;"></span>', 'YouTube 동영상').click(InsertYouTube);
    insertablesDropDown.button('<span class="ion-map"></span>', '지도').click(MapMacro);
    // set Size
    if (ENV.Discussing)
      rootDiv.style.height = '170px';
    else
      rootDiv.style.height = '600px';

    // Add NamuFix Div
    var oldTextarea = document.querySelector("textarea");
    var wText = oldTextarea.value;
    oldTextarea.parentNode.insertBefore(rootDiv, oldTextarea);
    oldTextarea.parentNode.removeChild(oldTextarea);
    txtarea.value = wText;
  }
}
