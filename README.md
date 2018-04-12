# ipfs-peer-map-example

> A map of IPv4 IPFS peers that uses window.ipfs

Demo: https://tableflip.github.io/ipfs-peer-map-example/dist/

<img width="1136" alt="screen shot 2018-03-05 at 21 42 40" src="https://user-images.githubusercontent.com/152863/37002766-a86c0348-20c2-11e8-9ea6-5681fb37c680.png">

## Install

1. This app requires `window.ipfs`. Install the IPFS Companion web extension:

    <a href="https://addons.mozilla.org/en-US/firefox/addon/ipfs-companion/" title="Get the add-on"><img width="86" src="https://blog.mozilla.org/addons/files/2015/11/AMO-button_1.png" /></a> <a href="https://chrome.google.com/webstore/detail/ipfs-companion/nibjojkomfdiaoajekhjakgkdhaomnch" title="Get the extension"><img width="103" src="https://developer.chrome.com/webstore/images/ChromeWebStore_BadgeWBorder_v2_206x58.png" /></a>

2. Install dependencies `npm install`
3. Obtain a MapBox access token
4. Build the app `MAPBOX_ACCESS_TOKEN=[your access token] npm run build`
5. Start the app `npm start`

### Develop

Instead of steps 4 & 5: `MAPBOX_ACCESS_TOKEN=[your access token] npm run watch`
