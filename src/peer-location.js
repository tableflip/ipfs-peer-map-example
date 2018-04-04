const EventEmitter = require('events')
const queue = require('queue')
const geoip = require('ipfs-geoip')

// events 'peers' [{ addr, peer }]
class PeerEmitter extends EventEmitter {
  constructor (ipfs, opts) {
    super()
    this._ipfs = ipfs
    this._options = opts || {}
    this._options.interval = this._options.interval || 10000
    this._updatePeers = this._updatePeers.bind(this)
    this._updatePeers()
  }

  _updatePeers () {
    this._ipfs.swarm.peers((err, peers) => {
      this._timeout = setTimeout(this._updatePeers, this._options.interval)
      if (err) return this.emit('error', err)
      this.emit('peers', peers)
    })
  }

  destroy () {
    clearTimeout(this._timeout)
    delete this._ipfs
  }
}

// events 'add' { id, location }
//        'remove' id
// Note ID is BS58 encoded
class PeerLocationEmitter extends EventEmitter {
  constructor (ipfs, opts) {
    super()
    this._ipfs = ipfs
    this._options = opts || {}
    this._peers = {}
    this._onPeers = this._onPeers.bind(this)
    this._peerEmitter = new PeerEmitter(ipfs, opts)
    this._peerEmitter.on('peers', this._onPeers)
    this._onQueueError = this._onQueueError.bind(this)
    this._queue = queue({ concurrency: 5, autostart: true })
    this._queue.on('error', this._onQueueError)
  }

  _onPeers (peers) {
    // https://github.com/ipfs/js-ipfs/issues/1248
    const getPeerId = (p) => {
      return p.peer.toB58String ? p.peer.toB58String() : p.peer.id.toB58String()
    }

    const added = peers.filter(p => !this._peers[getPeerId(p)])

    const removed = Object.keys(this._peers).filter(id => {
      return peers.every(p => getPeerId(p) !== id)
    })

    console.log('added', added.length)
    console.log('removed', removed.length)

    added.forEach(p => {
      const id = getPeerId(p)
      this._peers[id] = { location: null }

      this._queue.push((cb) => {
        if (!this._peers[id]) return cb()

        const ipv4Tuples = p.addr.stringTuples().filter(t => t[0] === 4)

        if (!ipv4Tuples.length) {
          console.log(`cannot lookup non IPv4 addr ${p.addr}`)
          return cb()
        }

        geoip.lookup(this._ipfs, ipv4Tuples[0][1], (err, location) => {
          if (err) return cb(err)
          if (!this._peers[id]) return cb()
          console.log(`successful lookup for ${p.addr}`)
          this._peers[id].location = location
          cb()
          this.emit('add', { id, location })
        })
      })
    })

    removed.forEach(id => { delete this._peers[id] })
    removed.forEach(id => this.emit('remove', id))
  }

  _onQueueError (err) {
    this.emit('error', err)
  }

  destroy () {
    this._queue.removeListener('error', this._onQueueError)
    this._queue.end()
    delete this._queue

    this._peerEmitter.removeListener(this._onPeers)
    this._peerEmitter.destroy()
    delete this._peerEmitter

    delete this._peers
  }
}

exports.PeerLocationEmitter = PeerLocationEmitter
