dbPassword = 'mongodb+srv://<username>:'+ encodeURIComponent('<password') + '@cluster0.op4yqul.mongodb.net/test?retryWrites=true&w=majority';
module.exports = {
    mongoURI: dbPassword
};
