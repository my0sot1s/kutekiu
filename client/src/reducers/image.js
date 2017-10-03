import { AFTER_LIST_IMAGES } from '../types/images'

const initState = {
    data: [],
    meta: {}
}
export default (state = initState, { type, data, meta }) => {

    switch (type) {
        case types.AFTER_LIST_IMAGES:
            return { ...state, data, meta }
    }
    return state
}
