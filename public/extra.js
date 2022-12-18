//const index = require('../data/index');

// document.getElementById("favouritesButton").addEventListener("click", function() {
//     console.log("in get ele")
//     // favourites();
// }, false);

function favourites()
{   
    var elem = document.getElementById('favouritesButton');
    if (elem.value=="Added!") elem.value = "Add to favourites";
    else elem.value = "Added!";
} 

// function replaceButtonText(buttonId, text)
// {
//     console.log("in replace extra");
//   if (document.getElementById)
//   {
//     var button=document.getElementById(buttonId);
//     if (button)
//     {
//       if (button.childNodes[0])
//       {
//         button.childNodes[0].nodeValue="Add to favourites";
//       }
//       else if (button.value)
//       {
//         button.value="Added!";
//       }
//       else //if (button.innerHTML)
//       {
//         button.innerHTML="Added!";
//       }
//     }
//   }
// }

//module.exports = favourites;

let commentForm = document.getElementById('postComment');
let cancelButton = document.getElementById('cancelButton');
cancelButton.addEventListener("click",(event)=>{
    commentForm.reset();
});