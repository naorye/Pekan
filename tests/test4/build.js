({
    baseUrl: './app/js',
    jsIn: 'main.js',
    jsOut: '../../all.js',
    errorCallback: function(error) {
        console.log(error);
    },
    infoCallback: function(info) {
        console.log(info);
    }
})