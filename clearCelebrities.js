'use strict'

const _ = require('lodash')
const path = require('path')
const fs = require('fs')
const CsvReader = require('csv-reader')
const Promise = require('bluebird')
const mysql = require('promise-mysql')
const pinyin = require('pinyin')

const AipFaceClient = require('baidu-aip-sdk').face
const config = require('config')
const baiduConfig = config.get('baiduConfig')
const APP_NAME = baiduConfig.APP_NAME
const APP_KEY = baiduConfig.APP_KEY
const APP_SECRET = baiduConfig.APP_SECRET
const MALE_GROUP_ID = baiduConfig.CELEBRITY_MALE_TEST_GROUPID
const FEMALE_GROUP_ID = baiduConfig.CELEBRITY_FEMALE_TEST_GROUPID

let currentGroup = ''

const getGroupUsers = (groupId) => {

  return new Promise(function(resolve, reject) {

    currentGroup = groupId

    let faceClient = new AipFaceClient(APP_NAME, APP_KEY, APP_SECRET)
    var options = {
      'start': 0,
      'num': 500
    }

    faceClient.getGroupUsers(groupId, options).then(function(result) {
      
      resolve(result.result)
    }).catch(function(err) {
      // 如果发生网络错误
      console.log(err)
      reject(err)
    })
  })
}

const removeFace = (faceUid) => {

  return new Promise(function(resolve, reject) {

    let faceClient = new AipFaceClient(APP_NAME, APP_KEY, APP_SECRET)

    let options = {}
    options['group_id'] = currentGroup

    faceClient.deleteUser(faceUid.uid, options).then(function(result) {

      console.log(`${faceUid.uid} removed.`)
      resolve(result)
    }).catch(function(err) {
      // 如果发生网络错误
      console.log(err)
      reject(err)
    })
  })
}



Promise.resolve()
  .then(() => getGroupUsers(MALE_GROUP_ID))
  .each((faceUid) => removeFace(faceUid))
  .then(() => getGroupUsers(FEMALE_GROUP_ID))
  .each((faceUid) => removeFace(faceUid))