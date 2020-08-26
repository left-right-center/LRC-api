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
    left: ['cnn.com',
        'buzzfeed.com',
        'msnbc.com',
        'nbcnews.com',
        'cbsnews.com',
        'washingtonpost.com',
        'time.com',
        'abcnews.go.com',
        'politico.com',
        'vice.com',
        'nytimes.com',
    ],
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
                pageSize: 100,
                page: 1,
                sources
            })
            let links = []
            response.articles.forEach( element => {
                links.push({
                    title: element.title,
                    link: element.url
                })
            })
            resolve(links)
        } catch (err) {
            console.log(err.message)
            reject(err.message)
        }
    })
}

app.get('/links', async (req, res) => {
    const url = req.query.url
    console.log('Request received ', url)

    try {
        const title = await getTitle(url)
        let keyword = subject.extract(title)
        // console.log(keyword)
        const links = await getLinks(keyword, url)
        // TODO: sort links
        // Aritra KoderBoie Kode
        let suggestions = [];
        let prefix = [];
        //  CASE WHERE WE DON'T GET ENOUGH RESULTS
        if (links.length < 3) {
            const error = "Not enough results to give 3 suggestions"
            // this is error handling where we would then just randomly search the net for the very first 3 articles we find from any source other than the current one which user is reading
            return res.status(404).send({
                error,
                links
            })
        }
        //  CASE WHERE WE ENSURE THAT WE HAVE AT LEAST MORE THAN 1 RESULT
        if (links.length > 0) {
            suggestions.push(links[0].link)
            let arr = links[0].link.split("/")
            prefix.push(arr[2])
        }
        // INITIALLY, WE ONLY HAVE ONE LINK, AND THUS WE HAVE NOT FOUND SECOND ARTICLE YET
        let foundSecondArticle = false;
        links.every(element => {
            //IF CURRENT LINK DOES NOT INCLUDES THE PREFIX OF THE FIRST ARTICLE AND SECOND ARTICLE HAS ALSO NOT YET BEEN FOUND
            if (!element.link.includes(prefix[0]) && !foundSecondArticle) {
                suggestions.push(element.link)
                let arr = element.link.split("/")
                prefix.push(arr[2])
                foundSecondArticle = true;
            }
            // IF SECOND ARTICLE FOUND, AND PREFIXES OF FIRST AND SECOND ARTICLE ARE NOT INCLUDED
            else if (foundSecondArticle && !element.link.includes(prefix[0]) && !element.link.includes(prefix[1])) {
                suggestions.push(element.link)
                let arr = element.link.split("/")
                prefix.push(arr[2])
                return false; //THIS EXITS AN every() function WHICH IS NOT POSSIBLE IN A FOREACH
            }
            return true; //this lets the every() function continue
        })
        // in case not enough unique articles
        if (prefix.length < 3 && links.length >=3) {
            links.every(element => {
                suggestions.push(element.link)
                let arr = element.link.split("/")
                prefix.push(arr[2])
                if (prefix.length === 3) return false; //lets us exit every() function
                return true;
            })
        }
        console.log('Success')
        return res.status(200).send(suggestions)
        
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
