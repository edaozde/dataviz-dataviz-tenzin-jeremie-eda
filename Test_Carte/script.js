let map = document.querySelector("#map")
let paths = document.querySelectorAll(".map__image a")
let links = document.querySelectorAll(".map__list a")

if (NodeList.prototype.forEach !== undefined) {
    NodeList.prototype.forEach = function (callback) {
        [].forEach.call(this, callback)
    }
}

const activeArea = (id) => {
    map.querySelectorAll('.is-active').forEach(function (item) {
        item.classList.remove('is-active')
    })
    if (id !== undefined) {
        document.querySelector('#list-' + id).classList.add('is-active')
        document.querySelector('#country-' + id).classList.add('is-active')
    }
}

paths.forEach(function (path) {
    path.addEventListener('mouseenter', function () {
        let id = this.id.replace('country-', '')
        activeArea(id)
    })
})

links.forEach(function (link) {
    link.addEventListener('mouseenter', function () {
        let id = this.id.replace('list-', '')
        activeArea(id)
    })
})

map.addEventListener('mouseover', function () {
    activeArea()
})