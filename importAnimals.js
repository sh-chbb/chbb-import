'use strict'

const path = require('path')
const fs = require('fs')
const CsvReader = require('csv-reader')
const Promise = require('bluebird')

const animalFile = path.join(__dirname, '/content/animal/animals.csv')
const imgPath = path.join(__dirname, '/content/animal/img2/')
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
        let animalName = animals[0]
        let animalDesc = animals[4]
        let animalImage = path.join(imgPath, `${animalName}.jpg`)
        let animalVocal = path.join(vocalPath, `${animalName}.mp3`)
        
        
        // console.log(`Animal Name: ${animal[0]}, desc: ${animal[4]}`)
        resolve()
      })
    })
  })
}

processImport()