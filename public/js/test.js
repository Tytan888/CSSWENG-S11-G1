var url = ""
$.get('/fileName', async function (data) {

    if (data != null && data.filename.length > 0) {
        console.log(data)
        for (var i = 0; i < data.filename.length; i++) {
            console.log(data.filename[i].title)
            console.log(data.filename[i]._id)
            url = '/imageByName?name=' + data.filename[i].title;
            console.log(url)
            $('<img/>').attr('id', i).css({ 'width': '100px', 'height': '100px' }).appendTo($('#load_image_here'));
            $('#' + i).attr('src', url);
        }
    }
})