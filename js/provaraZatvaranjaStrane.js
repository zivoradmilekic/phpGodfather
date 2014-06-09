function closeIt(){
  return "Any string value here forces a dialog box to \n" + 
  	     "appear before closing the window.";
}
window.onbeforeunload = closeIt;