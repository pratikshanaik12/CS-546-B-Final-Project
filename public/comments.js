let form = document.getElementById('postComment');
let commentInput = document.getElementById('comment');
let errorDiv = document.getElementById('empty-comment');

form.addEventListener('submit', (event) => {
   event.preventDefault();
   if(!commentInput.value || !/\S/.test(commentInput.value)) {
       errorDiv.hidden = false;
       errorDiv.innerHTML = 'Comment cannot be empty!';
       form.reset();
       errorDiv.focus();
   }
   else
       errorDiv.hidden = true;
});

commentInput.addEventListener('input', ()=>{
    errorDiv.hidden = true
})