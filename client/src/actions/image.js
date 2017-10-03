
import { AFTER_LIST_IMAGES } from '../types/image'

const fetcher = require("./fetcher").default;

export const getImages = () => {
    return dispatch => fetcher(link)
        .then(payload => dispatch(afterImages(payload)))
        .catch(err => dispatch(afterImages(err)))
}
// type: constants.GET_LIST_IMAGES
export const afterImages = ({ data, meta }) => ({
    type: AFTER_LIST_IMAGES,
    data,
    meta
})