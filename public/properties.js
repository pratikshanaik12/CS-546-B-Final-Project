let bedRadio = document.forms["bed-form"].elements["bed"];
for(var i = 0, max = bedRadio.length; i < max; i++) {
    bedRadio[i].onclick = function() {
        const form = document.getElementById("bed-form");
        let bathRadio = document.forms["bed-form"].elements["bath"];
        let bedclass = document.getElementById('bed-radio');
        let bathclass = document.getElementById('bath-radio');
        bathclass.hidden = false;
        bedclass.hidden = true;
        for(var i = 0, max = bathRadio.length; i < max; i++) {
            bathRadio[i].onclick = function() {
                bathclass.hidden = true;
                bedclass.hidden = false;
                form.submit();
            }
        }
    }
}
