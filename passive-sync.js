var assign = require('object-assign')

var BaseSync = require('./base-sync')

/**
 * Passive node in synchronization pair.
 *
 * Instead of active node, it doesn’t initialize synchronization
 * and destroy itself on disconnect.
 *
 * For example, passive sync is used for server and active for browser clients.
 *
 * @param {string} host Unique current host name.
 * @param {Log} log Logux log instance to sync with other node log.
 * @param {Connection} connection Connection to other node.
 * @param {object} [options] Synchronization options.
 * @param {object} [options.credentials] This node credentials.
 *                                       For example, access token.
 * @param {authCallback} [options.auth] Function to check
 *                                      other node credentials.
 * @param {number} [options.timeout=0] Timeout in milliseconds
 *                                     to disconnect connection.
 * @param {number} [options.ping=0] Milliseconds since last message to test
 *                                  connection by sending ping.
 * @param {filter} [options.inFilter] Function to filter events
 *                                    from other client. Best place
 *                                    for access control.
 * @param {mapper} [options.inMap] Map function to change event
 *                                 before put it to current log.
 * @param {filter} [options.outFilter] Filter function to select events
 *                                     to synchronization.
 * @param {mapper} [options.outMap] Map function to change event
 *                                  before sending it to other client.
 *
 * @example
 * import { PassiveSync } from 'logux-sync'
 * startServer(ws => {
 *   const connection = new WSServerConnection(ws)
 *   const sync = new PassiveSync('server' + id, log, connection)
 * })
 *
 * @extends BaseSync
 * @class
 */
function PassiveSync (host, log, connection, options) {
  BaseSync.call(this, host, log, connection, options)
  if (this.options.fixTime) {
    throw new Error(
      'PassiveSync could not fix time. Set opts.fixTime for ActiveSync node.')
  }
  if (options && (options.synced || options.otherSynced)) {
    throw new Error(
      'PassiveSync could not use synced and otherSynced options.')
  }
}

PassiveSync.prototype = {

  onConnect: function onConnect () {
    BaseSync.prototype.onConnect.call(this)
    this.startTimeout()
  },

  onDisconnect: function onDisconnect () {
    BaseSync.prototype.onDisconnect.call(this)
    this.destroy()
  },

  connectMessage: function connectMessage () {
    BaseSync.prototype.connectMessage.apply(this, arguments)
    this.endTimeout()
  }

}

PassiveSync.prototype = assign({ }, BaseSync.prototype, PassiveSync.prototype)

module.exports = PassiveSync