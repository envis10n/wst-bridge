
# WST-Bridge

![Mudlet using WST-Bridge] (https://raw.githubusercontent.com/envis10n/wst-bridge/master/images/mudlet_wst-bridge.png)

A bridge for `ws-telnet` servers to be accessed via a local TCP proxy.

This allows a regular telnet client / MUD client to interface with a server running WST (`ws-telnet` Telnet over WebSockets).

Currently known working MUD clients: Mudlet

## Config

Config path: `$CWD/config.json`

This file must be valid JSON, and will be written with defaults if it is not found.

#### Values
- local

	- host: The host string to bind to. Recommended | Default = `localhost`

	- port: The port to bind to locally. Default = `13337`

- remote: The remote WebSocket URI to connect to. Default = `wss://mudjs.net:13337`
