'use strict'

const path = require('path')
const fs = require('fs')
const CsvReader = require('csv-reader')
const Promise = require('bluebird')
const mysql = require('promise-mysql')
const pinyin = require('pinyin')

const celebrityFile = path.join(__dirname, '/content/celebrity/celebrity.csv')
const imgPath = path.join(__dirname, '/content/celebrity/img/')

const inputStream = fs.createReadStream(celebrityFile, 'utf8')

let maleList = []
let femaleList = []

const loopImages = () => {

  return fs.readdirSync(imgPath)
}



const processImport = (images) => {

  Promise.resolve().then(() => {

    return new Promise(resolve => {

      let celebrities = []

      inputStream
        .pipe(CsvReader({
          parseNumbers: true,
          parseBooleans: true,
          trim: true
        }))
        .on('data', function (row) {
          celebrities.push(row)
        })
        .on('end', function () {
          resolve(celebrities)
        })
    }).then((celebrities) => {

      Promise.each(celebrities, celebrity => {

        return new Promise(resolve => {

          let name = celebrity[1]
          let gender = celebrity[2]
          let dob = celebrity[3]
          let job = celebrity[4]
          let nationality = celebrity[5]
          let birthCity = celebrity[6]
          let desc = celebrity[7]
          let url = celebrity[8]

          let celeb = {
            name: name,
            gender: gender,
            dob: dob,
            job: job,
            nationality: nationality,
            birthCity: birthCity,
            desc: desc,
            url: url
          }

          // console.log(`Name: ${name}, gender: ${gender}, url: ${url}`)
          if (gender == '男') {
            
            maleList.push(celeb)
          } else if (gender == '女') {

            femaleList.push(celeb)
          } else {

            console.log(celebrity[0], 'wrong gender')
          }
          resolve()
        })
      }).then(() => {

        // console.log(`Male: ${maleList.length}`)
        // console.log(`Female: ${femaleList.length}`)
        let wholeList = maleList.concat(femaleList)

        Promise.each(wholeList, person => {

          return new Promise(resolve => {

            let pinyinName = pinyin(person.name, {
              style: pinyin.STYLE_NORMAL, 
              heteronym: false
            })
            
            let res = findImage(images, pinyinName.join(''))

            if (res.length < 1) {
              console.log(person.name)
            }
            // console.log(`Person: ${person.name}, Image: ${fs.existsSync(personImg)}; Young Image: ${fs.existsSync(youthImg)}`)
            resolve()
          })
        }).catch((err) => {
          
          console.log(err)
        })
      })
    })
  })
}

function findImage(images, fileName) {

  let result = []
  images.forEach(i => {

    if (i.indexOf(fileName) > -1) {
      
      result.push(i)
    }
  })
  return result
}

Promise.resolve()
  .then(() => loopImages())
  .then((images) => processImport(images))

