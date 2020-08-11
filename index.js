

const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.get('/opposite', (req, res) => {
    const { url, numLinksWanted } = req.body
    console.log('request received', url)
    // processing
    res.status(200).send({
        url1: url,
        url2: url,
        url3: url,
        numLinksWanted
    })
})

app.listen(9000, () => {
    console.log('Listening on Port 9000')
})


