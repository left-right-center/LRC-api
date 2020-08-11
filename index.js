

const express = require('express');
const cors = require('cors');
const axios = require('axios')

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// function handler(response) {
//     response.status(200).send({
//         received: true
//     })
// }

app.get('/opposite', (req, res) => {
    const { url, numLinksWanted } = req.body
    console.log('request received', url)
    const googleAPI = "https://www.googleapis.com/customsearch/v1"
    // process stuff here.
    try {
        axios.get(googleAPI, {
        params: {
            key: "AIzaSyBPKUH3mZ6cTutHvO3ID2G42lYXkjoXWzI",
            cx: "016572307064780577671:dwwtulj6stk",
            q: "trump"
        }
        })
        .then(response => {
            console.log(response.data.items[1])
            let arrayOfTitles = []
            response.data.items.forEach(element => arrayOfTitles.push(element.title))
            res.status(200).send(arrayOfTitles)
        })
    } catch (err) {
        console.log(err.message)
        console.log(err)
        console.error()
        res.status(404).send({})
    }
    
    // https://www.googleapis.com/customsearch/v1?key=AIzaSyBPKUH3mZ6cTutHvO3ID2G42lYXkjoXWzI&cx=016572307064780577671:dwwtulj6stk&q=hot+tub&callback=hndlr
    
})

app.listen(9000, () => {
    console.log('Listening on Port 9000')
})


