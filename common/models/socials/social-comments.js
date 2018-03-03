'use strict';


/**
 * @author te.ng   - <manhte231>
 */
const app = require('../../../server/server');
const cst = require('../../../utils/constants')
const Promise = require('bluebird');
const netw = require('../../../utils/network')
const ObjectID = require('mongodb').ObjectID;
const GET_FIRST = 1;

module.exports = function (Socialcomments) {
  /**
   * Lấy tất cả các comment của post_id
   */
  Socialcomments.getComments = function (post_id, limit, page) {
    if (!limit) limit = 10;
    if (!page) page = 1;
    return Socialcomments.find({
      where: {
        post_id: new ObjectID(post_id),
      },
      limit,
      skip: limit * (page - 1),
      order: 'created DESC'
    })
  }
  Socialcomments.getCommentCount = function (post_id) {
    return Socialcomments.count({ post_id: new ObjectID(post_id) })
  }


  Socialcomments.getDetailComment = function (post_id) {
    return Promise.all([
      Socialcomments.getCommentCount(post_id),
      Socialcomments.get2Comment(post_id)
    ])
  }


  Socialcomments.get2Comment = function (post_id) {
    // Lấy 2 comment cuối cùng
    return Socialcomments
      .getComments(post_id, GET_FIRST, 2)
      .then(doc => {
        return Promise.map(doc, v => {
          return app.models.social_user
            .getByUser_id(v.user_id, ['displayName', 'avatar'])
            .then(pim => {
              return { data: v, user: pim }
            })
        })
      })
  }
  Socialcomments.pushComment = function (user_id, post_id, comment) {
    return Socialcomments.create({
      user_id,
      post_id: new ObjectID(post_id),
      content: comment,
      created: new Date()
    })

  }
  /**
   * Rest Define
   */

  Socialcomments.getAllComments = function (post_id, limit, page, cb) {
    Socialcomments.getComments(post_id, limit, page)
      .then(doc => {
        // let list_user = [];
        if (doc.length === 0) {
          return [];
        } else
          return Promise.map(doc, (item) => {
            return { user_id: item.user_id }
          })
            .then((list_user) => {
              // sàng lọc các user_trùng
              return list_user.filter((value, index, self) =>
                self.findIndex(t => { return value.user_id === t.user_id; }) === index)
            })
            .then(list_user => {
              // lấy đc danh sách [{user_id}]
              return app.models.social_user
                .getUserInfoByListUser(list_user, ['user_id', 'username', 'displayName', 'avatar'])
                .then(user_info => {
                  return Promise.map(doc, (item) => {
                    return app.models.social_user
                      .findUser(item.user_id, user_info)
                      .then(user => {
                        return { user, comment: item }
                      })
                  })
                })
            })
      })
      .then(doc => {
        cb(null, cst.SUCCESS_CODE, cst.GET_SUCCESS, doc);
      })
      .catch(err => {
        cb(null, cst.FAILURE_CODE, cst.GET_FAILURE, err);
      })
  }

  Socialcomments.addComment = function (user_id, post_id, comment, cb) {
    Socialcomments.pushComment(user_id, post_id, comment)
      .then(doc => {
        cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, doc);
      })
      .catch(err => {
        cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, err);
      })
  }
  Socialcomments.deleteCommment = function (user_id, post_id, cb) {
    Socialcomments.destroyAll({
      user_id,
      post_id
    })
      .then(doc => {
        cb(null, cst.SUCCESS_CODE, cst.POST_SUCCESS, doc);
      })
      .catch(err => {
        cb(null, cst.FAILURE_CODE, cst.POST_FAILURE, err);
      })
  }
  Socialcomments.deleteAllCommentOfPost = function (post_id) {
    return Socialcomments.destroyAll({
      post_id: new ObjectID(post_id),
    })
  }
  //-----------------------------------------------//

  Socialcomments.remoteMethod('deleteCommment', {
    http: { path: '/del-comment', verb: 'delete' },
    description: 'Sử dụng qua post man',
    accepts: [
      { arg: 'user_id', type: 'number', required: true },
      { arg: 'post_id', type: 'string', required: true },
    ],
    returns: [
      { arg: 'status', type: 'number' },
      { arg: 'message', type: 'string' },
      { arg: 'data', type: 'object' }
    ]
  })
  Socialcomments.remoteMethod('addComment', {
    http: { path: '/add-comment', verb: 'post' },
    description: 'Sử dụng qua post man',
    accepts: [
      { arg: 'user_id', type: 'number', required: true },
      { arg: 'post_id', type: 'string', required: true },
      { arg: 'comment', type: 'string', required: true }
    ],
    returns: [
      { arg: 'status', type: 'number' },
      { arg: 'message', type: 'string' },
      { arg: 'data', type: 'object' }
    ]
  })
  Socialcomments.remoteMethod('getAllComments', {
    http: { path: '/all-comments', verb: 'get' },
    description: 'Sử dụng qua post man',
    accepts: [
      { arg: 'post_id', type: 'string', required: true },
      { arg: 'limit', type: 'number' },
      { arg: 'page', type: 'number' }
    ],
    returns: [
      { arg: 'status', type: 'number' },
      { arg: 'message', type: 'string' },
      { arg: 'data', type: 'array' }
    ]
  })
};
