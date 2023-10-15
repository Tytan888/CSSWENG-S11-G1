var url = ""
$.get('/fileName', async function(data){
   
    if(data!=null &&data.filename.length>0){
        for(var i =0; i < data.filename.length;i++){
            console.log(data.filename[i].title)
            url = '/imageByName?name='+data.filename[i].title;
            $('<img/>').attr('id',i).css({'width':'100px', 'height':'100px'}).appendTo($('#load_image_here'));
            $('#'+i).attr('src',url);
        }
    }
})