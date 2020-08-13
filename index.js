const express = require('express');
const cors = require('cors');
const axios = require('axios')
const getTitleAtUrl = require('get-title-at-url');
const subjects = require("subject-extractor")
const NewsAPI = require('newsapi');
const NEWS_API_KEY = '75ab2037750b4c56825c31ea50160ea0';
const newsapi = new NewsAPI(NEWS_API_KEY);

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

//all helper functions are placed here within this class
class helperFunctions {
    static getKeywords = (title, res) => {
        console.log("After title", title)
        let keywords = ""
        keywords = subjects.extract(title)
        console.log(keywords)
        helperFunctions.getURL(keywords, res)
    }
    static getURL = (keywords, res) => {
        newsapi.v2.everything({
            q: keywords,
            language: 'en',
            sortBy: 'relevancy',
            page: 1
        }).then(response => {
            console.log(response);
            let articles = response.articles;
            let links = []
            articles.forEach (element => {
                links.push({
                    title: element.title,
                    link : element.url
                })
            })
            res.status(200).send(links);
            
        })
    }
    static getTitle = (url, res) => {
        return Promise.resolve(getTitleAtUrl(url, function(title){
            console.log(title);
            helperFunctions.getKeywords(title, res)
        }))
    }
};

//this is the finall call that sends results!
result = async (url, res) => {
    await helperFunctions.getTitle(url,res)
}

app.get('/opposite', async (req, res) => {
    const { url } = req.body
    console.log(1)
    console.log('request received', url)

    try {
        await result(url, res)
    } catch (err) {
        console.log(err)
    }
    
})


app.listen(9000, () => {
    console.log('Listening on Port 9000')
})