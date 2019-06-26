var theParentWindow;

function haveParent(theParent){
    // parentwindowcontrol(theParent);
    theParentWindow = theParent.window;
    // theParentWindow.window.alert('dfdf');
    // theParentWindow.postMessage('Hello', '*');
}

module.exports = haveParent;