'use strict'

const path = require('path')
const fs = require('fs')
const CsvReader = require('csv-reader')
const Promise = require('bluebird')
const mysql = require('promise-mysql')
const pinyin = require("pinyin")

const animalFile = path.join(__dirname, '/content/animal/animals.csv')
const imgPath = path.join(__dirname, '/content/animal/img/')
const vocalPath = path.join(__dirname, '/content/animal/vocal')

const inputStream = fs.createReadStream(animalFile, 'utf8')

const processImport = () => {

  Promise.resolve().then(() => {

    return new Promise(resolve => {

      let animals = []

      inputStream
        .pipe(CsvReader({
          parseNumbers: true,
          parseBooleans: true,
          trim: true
        }))
        .on('data', function (row) {
          animals.push(row)
        })
        .on('end', function () {
          resolve(animals)
        })
    })
  }).then((animals) => {

    Promise.each(animals, animal => {

      return new Promise(resolve => {
        // console.log(path.join(imgPath, `${animal[0]}.jpg`))
        let animalName = animal[0]
        let animalDesc = animal[4]

        let animalImage = path.join(imgPath, `${animalName}.jpg`)
        let animalVocal = path.join(vocalPath, `${animalName}.mp3`)

        let connection
        mysql.createConnection({
          host: 'localhost',
          user: 'root',
          password: 'root',
          database: 'chbb_chatbot_dev'
        }).then((conn) => {

          connection = conn
          let query = `insert into animal values (null, "${animalName}", "${animalDesc}");`
          return connection.query(query)
        }).then((result) => {

          let animalId = result.insertId
          let query = `insert into animalImage values (null, ${animalId}, "/images/animals/${animalName}.jpg");`
          connection.query(query)
          return animalId
        }).then((animalId) => {
          
          if (fs.existsSync(animalVocal)) {

            let query = `insert into animalAudio values (null, ${animalId}, "/images/animals/${animalName}.mp3");`
            return connection.query(query)
          }
          return
        }).then(() => {

          resolve()
        }).catch((err) => {
          console.log(err)
        })
      })
    })

    return 
  })
}

processImport()