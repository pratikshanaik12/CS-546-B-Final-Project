(function($) {
    var commentForm = $('#postComment');
    var newComments = $('#new-comments');
    var wholePage = $('#whole-page');

    commentForm.submit(function(event) {
        event.preventDefault();
        var comment = $('#comment').val()
        var userId = $('#user_id').val();
        // console.log(comment);
        if(comment) {
            var requestConfig = {
                method: 'POST',
                url: '/properties/property/comments/'+userId,
                contentType: 'application/json',
                data: JSON.stringify({
                    id: userId,
                    comment: comment,
                })
            };

            $.ajax(requestConfig).then(function (responseMessage) {
                var newElement = $(responseMessage);
                wholePage.replaceWith(newElement);
                // $('#comment').val('');
            });
        }
    })

})(window.jQuery);

// $(document).ready(function () {
//     $("#submit").click(function () {
//        $.post("/request",
//           {
//              name: "viSion",
//              designation: "Professional gamer"
//           },
//           function (data, status) {
//              console.log(data);
//           });
//     });
//  });

// var currentLink = $(this);
//       var currentId = currentLink.data('id');