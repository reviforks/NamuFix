var first='src/main.js'
var output='NamuFix.user.js';

var fs=require('fs');
function RemoveDup(arr){
  var arr1=[];
  for(var i=0;i<arr.length;i++){
    if(arr1.indexOf(arr[i])==-1)
      arr1.push(arr[i]);
  }
  return arr1;
}
function getIncluded(fn){
  var read=fs.readFileSync(fn,{encoding:"utf8"});
  var IncludePattern=/\/\*\* Include\("(.+?)"\) \*\*\//g;
  if(read.search(IncludePattern)==-1){
    return read;
  }
  var filenames=[];
  while(true){
    var matched=IncludePattern.exec(read);
    if(matched==null) break;
    matched=matched[1];
    filenames.push(matched);
  }
  filenames=RemoveDup(filenames);
  for(var i=0;i<filenames.length;i++){
    console.log('Working with '+filenames[i]);
    var brp='/** Include(\"'+filenames[i]+'\") **/';
    while(read.indexOf(brp)!=-1){
      console.log('Replacing in '+fn);
      read=read.replace(brp,'// Included : '+filenames[i]+'\n'+getIncluded(filenames[i]));
    }
  }

  var devBranch="raw.githubusercontent.com/LiteHell/NamuFix/dev";
  var masterBranch="raw.githubusercontent.com/LiteHell/NamuFix/master";
  var masterMode=process.argv.indexOf('master')>1;
  while(read.indexOf(masterMode?devBranch:masterBranch)!=-1){
    read=read.replace(masterMode?devBranch:masterBranch,masterMode?masterBranch:devBranch);
  }

  try{
    var beautifier=require('js-beautify').js_beautify;
    var indented=read;
    indented=beautifier(indented,{indent_size: 2});
    read=indented();
  }catch(err){
    console.log('error while beautifig code ('+err.name+', '+err.message+'), but not a serious problem.\nIf you want to beautify code without any error, install js-beautify library. by "npm install js-beautify"');
  }
  return read;
}
fs.writeFileSync(output,getIncluded(first),{"encoding":"utf8"});
