import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import logger from 'redux-logger'
import rootReducer from '../reducers'

const middleware = [thunk]
if (process.env.NODE_ENV === 'development') {
    middleware.push(logger)
}

export default initState => {
    const enhancer = compose(
        applyMiddleware(...middleware)
    )
    const store = createStore(rootReducer, initState, enhancer)

    return store
}