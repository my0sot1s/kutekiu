'use strict';
const app = require('../../../server/server');
const cst = require('../../../utils/constants')
const Promise = require('bluebird')
const netw = require('../../../utils/network')

/**
 *
 * @param {date} date
 */
function dateProcess(date) {
  date = new Date(date);
  if (typeof date.getMonth === 'function')
    return date.toISOString().slice(0, 10).replace(/-/g, '');
  else return new Date().toISOString().slice(0, 10).replace(/-/g, '');

}

// console.log(dateProcess(new Date().toDateString()))

/**
 *
 * @callback cb
 * @author te.ng <manhte231@gmail.com>
 */


module.exports = function (Socialtimeline) {

  /**
   *
   * @param{string} post_id
   * @param{[{follower:number}]} list_consumer
   */
  Socialtimeline.createUserTimeLine = function (post_id, list_consumer) {
    return Promise.map(list_consumer,
      (comsumer) => {
        return {
          post_id,
          comsumer_id: comsumer.follower,
          created: new Date()
        }
      })
      .then(timeline => {
        return Socialtimeline.create(timeline)
      })
  }
  Socialtimeline.deleteAllTimeLineOfPost = function (post_id) {
    return Socialtimeline.destroyAll(
      { post_id }
    )
  }
  // /**
  //  * @param {string} id - là post_id
  //  */
  // Socialtimeline.pushTimeline = function (id) {
  //     let _date = dateProcess(new Date())
  //     return new Promise((resolve, reject) => {
  //         Socialtimeline.findOrCreate({
  //             dateFlow: _date
  //         }, {dateFlow: _date, timeline: []})
  //             .then(doc => {
  //                 Socialtimeline.update({id: doc[0].id},
  //                     {$push: {timeline: id.toString(), $position: 0}})
  //                     .then(doc => {
  //                         resolve(doc)
  //                     })
  //                     .catch(err => {
  //                         reject(err)
  //                     });
  //             })
  //             .catch(err => {
  //                 reject(err)
  //             });
  //     })
  // }
  /**
   *
   * @param{number} user_id
   */
  Socialtimeline.getPostWithTimeline = function (user_id) {
    if (isNaN(user_id)) return Promise.resolve(null)
    else
      return Socialtimeline.find({
        where: {
          consumer_id: user_id
        },
        fields: ['post_id']
      })
  }
  Socialtimeline.pre_getUserTimeLine = function (user_id, date, limit, page) {
    if (!date) date = new Date().toDateString();
    var str_date = dateProcess(date), skip = limit * (page - 1);
    return Socialtimeline.getPostWithTimeline(user_id)
      .then(list_post => {
        if (!list_post || list_post.length === 0) return {}
        else {
          return Promise.map(list_post, post_id => {
            return { post_id }
          }).then(value => ({ or: value }))
        }
      })
      .then(query => {
        return app.models.social_post.find({
          where: {
            ...query
          },
          limit,
          skip: limit * (page - 1),
          fields: {
            modified: false
          },
          order: 'created DESC'
        })
          .then(posts => {
            // dùng post để lấy người post
            return Promise.map(posts, item => {
              return { user_id: item.user_id };
            })
              .then(list_user => {
                return list_user.filter((value, index, self) =>
                  self.findIndex(t => {
                    return value.user_id === t.user_id;
                  }) === index);
              })
              .then(list_user => {
                // lấy đc danh sách [{user_id}]
                return app.models.social_user
                  .getUserInfoByListUser(list_user, ['user_id', 'username', 'displayName', 'avatar'])
                  .then(user_info => {
                    return Promise.map(posts, (item) => {
                      return app.models.social_user
                        .findUser(item.user_id, user_info)
                        .then(user => {
                          return { user, post: item }
                        })
                    })
                  })
              })
          })
          .then(doc => {
            return Promise.map(doc, p => {
              return app.models.social_comments
                .getDetailComment(p.post.id.toString())
                .then(log => {
                  return { ...p, comment: { count: log[0], cmt: log[1] } }
                })
                .catch(err => {
                  return err;
                })
            })
          })
          .then(doc => {
            return app.models.social_like
              .getLikeByListPost(doc, user_id)
            // .then(ret => { })
            // .then()
          })
      })
  }
  Socialtimeline.getTimeLine = function (user_id, date, limit, page, cb) {
    Socialtimeline.pre_getUserTimeLine(user_id, date, limit, page)
      .then(result => {
        console.info('--get from queue done!');
        // chấm dứt nghe queue
        cb(null, cst.SUCCESS_CODE, cst.GET_SUCCESS, result);
      })
      .catch(err => {
        cb(null, cst.FAILURE_CODE, cst.GET_FAILURE, err);
      });
  }
  Socialtimeline.remoteMethod('getTimeLine', {
    http: { path: '/getTimeLine', verb: 'get' },
    description: 'Sử dụng qua post man',
    accepts: [
      { arg: 'user_id', type: 'string' },
      { arg: 'date', type: 'string' },
      { arg: 'limit', type: 'number', default: 4 },
      { arg: 'page', type: 'number', default: 1 },
    ],
    returns: [
      { arg: 'status', type: 'number' },
      { arg: 'message', type: 'string' },
      { arg: 'data', type: 'object' }
    ]
  })
};
