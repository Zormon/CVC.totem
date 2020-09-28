class Timer {
    constructor(callback, delay) {
        this.timerId, this.start, this.remaining = delay
        this.callback = callback
        this.play()
    }

    pause() {
        window.clearTimeout(this.timerId)
        this.remaining -= Date.now() - this.start
    }

    play() {
        this.start = Date.now()
        window.clearTimeout(this.timerId)
        this.timerId = window.setTimeout(this.callback, this.remaining)
    }

    clear() {
        window.clearTimeout(this.timerId)
    }
}
