const express = require('express');
const cors = require('cors');
const axios = require('axios')
const getTitleAtUrl = require('get-title-at-url');
const subjects = require("subject-extractor")

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

let titlesAndLinks = []

const getURL = (keywords, res) => {
    const googleAPI = "https://www.googleapis.com/customsearch/v1"
    
    try {
        axios.get(googleAPI, {
            params: {
                key: "AIzaSyBPKUH3mZ6cTutHvO3ID2G42lYXkjoXWzI",
                cx: "016572307064780577671:dwwtulj6stk",
                q: keywords
            }
        })
        .then(response => {
            if(response.data) {
                response.data.items.forEach(element => {
                    titlesAndLinks.push({
                        title: element.title,
                        link: element.link
                    })
                })
            }
            res.status(200).send(titlesAndLinks)
            titlesAndLinks=[]
        })
    } catch (err) {
        console.log(err)
    }
}

const getKeywords = (title, res) => {
    console.log("After title", title)
    let keywords = ""
    subjects.extractAll(title).forEach(element => {
        keywords+=element
        keywords+=" "
    })
    console.log(keywords)

    getURL(keywords, res)
}

const getTitle = (url, res) => {
    return Promise.resolve(getTitleAtUrl(url, function(title){
        console.log(title);
        getKeywords(title, res)
    }))
}

app.get('/opposite', async (req, res) => {
    const { url } = req.body
    console.log(1)
    console.log('request received', url)

    try {
        getTitle(url, res)
    } catch (err) {
        console.log(err)
    }
    
})

app.listen(9000, () => {
    console.log('Listening on Port 9000')
})