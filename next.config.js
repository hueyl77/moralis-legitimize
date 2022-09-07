const path = require('path')

module.exports = {
  reactStrictMode: true,
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  images: {
    domains: ['ipfs.infura.io', 'legitimize.io', 'legitimize.mypinata.cloud'],
  },
}
