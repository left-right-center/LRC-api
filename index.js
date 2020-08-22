const express = require('express');
const cors = require('cors');
const axios = require('axios')
const getTitleAtUrl = require('get-title-at-url');
const NewsAPI = require('newsapi');
const subject = require('subject-extractor');

const NEWS_API_KEY = '75ab2037750b4c56825c31ea50160ea0';
const newsapi = new NewsAPI(NEWS_API_KEY);

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

const db = {
    left: ['cnn.com'],
    right: ['breitbart.com', 'foxnews.com', 'foxsports.com', 'washingtontimes.com', 'nationalreview.com'],
    center: ['bbc.com','reuters.com', 'bloomberg.com', 'usatoday.com', 'wsj.com', 'ap.org', 'thehill.com']
}

const sourceId = {
    left: [
        'cnn',
        'buzzfeed',
        'msnbc',
        'nbc-news',
        'cbs-news',
        'the-washington-post',
        'time',
        'abc-news',
        'politico',
        'vice-news'
    ],
    center: [
        'bbc-news',
        'bloomberg',
        'usa-today',
        'the-wall-street-journal',
        'associated-press',
        'the-hill'	
    ],
    right: [
        'fox-news',
        'fox-sports',
        'the-washington-times',
        'national-review'
    ]
}

const getTitle = async (url) => {
    return new Promise((resolve, reject) => {
        getTitleAtUrl(url, function(title) {
            resolve(title)
        })
    })
}

const getSources =  (url) => {
    let wing = "nothing"
    db.left.forEach(element => {
        if(url.includes(element)) {
            wing = 'left';
        }
    })
    if (wing === "left") {
        console.log(wing)
        const result = (sourceId.right.concat(sourceId.center)).toString();
        console.log(result)
        return result
    }

    db.right.forEach(element => {
        if(url.includes(element)) {
            wing = 'right';
        }
    })
    if (wing === "right") {
        console.log(wing)
        const result = (sourceId.left.concat(sourceId.center)).toString()
        console.log(result)
        return result
    }

    db.center.forEach(element => {
        if(url.includes(element)) {
            wing = 'center';
        }
    })
    if (wing === "center") {
        console.log(wing)
        return sourceId.left.concat(sourceId.right);
    }
}

const getLinks = async (keyword, url) => {
    return new Promise( async (resolve, reject) => {

        try {
            const sources = getSources(url)
            const response = await newsapi.v2.everything({
                q: keyword, // + opposite news outlet
                language: 'en',
                sortBy: 'relevancy',
                page: 3,
                sources
            })

            let links = []
            articles.forEach( element => {
                links.push({
                    title: element.title,
                    link: element.url
                })
            })
            resolve(links)
        } catch (err) {
            reject(err.message)
        }
    })
}

app.get('/links', async (req, res) => {
    const { url } = req.body
    console.log('Request received')

    try {
        const title = await getTitle(url)
        let keyword = subject.extract(title)
        const links = await getLinks(keyword, url)
        // TODO: sort links
        return res.status(200).send(links)
        
    } catch (err) {
        return res.status(404).send(err.message)
    }
})

app.get('/sources', async (req, res) => {
    await axios.get('https://newsapi.org/v2/sources?apiKey=75ab2037750b4c56825c31ea50160ea0')
    .then(response => {
        console.log(response)
        const sources = response.data.sources
        const arrOfId = []
        sources.forEach(element => {
            arrOfId.push(element.id)
        })
        res.status(200).send(arrOfId)
    })
    
})

app.listen(9000, () => {
    console.log('Listening on Port 9000')
})

// //all helper functions are placed here within this class
// class helperFunctions {
//     static getKeywords = (title, res) => {
//         console.log("After title", title)
//         let keywords = ""
//         keywords = subjects.extract(title)
//         console.log(keywords)
//         helperFunctions.getURL(keywords, res)
//     }
//     static getURL = (keywords, res) => {
//         newsapi.v2.everything({
//             q: keywords,
//             language: 'en',
//             sortBy: 'relevancy',
//             page: 1
//         }).then(response => {
//             console.log(response);
//             let articles = response.articles;
//             let links = []
//             articles.forEach (element => {
//                 links.push({
//                     title: element.title,
//                     link : element.url
//                 })
//             })
//             res.status(200).send(links);
            
//         })
//     }
//     static getTitle = (url, res) => {
//         return Promise.resolve(getTitleAtUrl(url, function(title){
//             console.log(title);
//             helperFunctions.getKeywords(title, res)
//         }))
//     }
// };

// //this is the finall call that sends results!
// result = async (url, res) => {
//     await helperFunctions.getTitle(url,res)
// }

// app.get('/opposite', async (req, res) => {
//     const { url } = req.body
//     console.log(1)
//     console.log('request received', url)

//     try {
//         await result(url, res)
//     } catch (err) {
//         console.log(err)
//     }
    
// })
///////////////////////////////
// newsapi.v2.everything({
//     q: keyword,
//     language: 'en',
//     sortBy: 'relevancy',
//     page: 1
// })
// .then(response => {
//     if(response) {
//         let articles = response.articles
//         let links = []
//         articles.forEach( element => {
//             links.push({
//                 title: element.title,
//                 link: element.url
//             })
//         })
//         resolve(links)
//     } else {
//         reject('newsapi failed to return response')
//     }
// })
/////////////////////
// getTitle(url)
// .then(title => {
//     let keyword = subject.extract(title) 

//     getLinks(keyword)
//     .then(links => {
//         return res.status(200).send(links)
//     })
//     .catch(error => {
//         console.log('an error occurred', error.message)
//         return res.status(404).send(error.message)
//     })
// })
// .catch(error => {
//     console.log('An error occured', error.message)
//     return res.status(404).send(error.message)
// })
