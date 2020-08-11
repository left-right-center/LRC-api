const express = require('express');
const cors = require('cors');
const axios = require('axios')
const getTitleAtUrl = require('get-title-at-url');
const subjects = require("subject-extractor")

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.get('/opposite', (req, res) => {
    const { url } = req.body
    console.log('request received', url)

    let titleOfTheArticle = "";
    getTitleAtUrl(url, function(title){
        console.log(title);
        titleOfTheArticle = title;
    });

    let keywords = ""
    // console.log(subjects.extractAll("Password sharing could be a good thing for Netflix and Hulu"));
    subjects.extractAll(titleOfTheArticle).forEach(element => {
        keywords+=element
        keywords+=" "
    })
    console.log(keywords)

    const googleAPI = "https://www.googleapis.com/customsearch/v1"
    // process stuff here.
    try {
        axios.get(googleAPI, {
        params: {
            key: "AIzaSyBPKUH3mZ6cTutHvO3ID2G42lYXkjoXWzI",
            cx: "016572307064780577671:dwwtulj6stk",
            q: keywords
        }
        })
        .then(response => {
            // console.log(response.data.items[0])
            let titlesAndLinks = []
            response.data.items.forEach(element => {
                titlesAndLinks.push({
                    title: element.title,
                    link: element.link
                })
            })
            res.status(200).send(titlesAndLinks)
        })
    } catch (err) {
        console.log(err)
    }
    
})

app.listen(9000, () => {
    console.log('Listening on Port 9000')
})


