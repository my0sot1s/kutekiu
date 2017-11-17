'use strict';

module.exports = function(Socialtags){
    /**
     *
     * @param {string} post_id
     * @param{string} tag
     */
    Socialtags.createTag = function(post_id ,tag) {
        return Socialtags.create({
            post_id,
            tag,
            created:new Date(),
        });
    };
};
