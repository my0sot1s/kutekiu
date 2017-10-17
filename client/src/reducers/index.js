export default require("redux").combineReducers({
    image: require("./image").default,
    timeline: require("./timeline").default,
})